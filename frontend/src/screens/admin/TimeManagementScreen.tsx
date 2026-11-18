import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { serviceOrderService } from '../../services/serviceOrder.service';
import { ServiceOrder } from '../../types/domain';

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const APPROVED_STATUSES = new Set(['APROVADO']);
const HOURS_ACCOUNTABLE_STATUSES = new Set(['APROVADO']);

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDisplayDate(dateString?: string): string {
  if (!dateString) return 'Sem data';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Sem data';
  return date.toLocaleDateString('pt-BR');
}

function getMonthMatrix(referenceDate: Date) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ key: string; date: Date; inMonth: boolean }> = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const date = new Date(year, month - 1, prevMonthDays - i);
    cells.push({ key: toDateKey(date), date, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ key: toDateKey(date), date, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const lastDate = cells[cells.length - 1].date;
    const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1);
    cells.push({ key: toDateKey(nextDate), date: nextDate, inMonth: false });
  }

  return cells;
}

function isVisibleOrder(status: string): boolean {
  return APPROVED_STATUSES.has(String(status || '').toUpperCase());
}

export default function TimeManagementScreen() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState<string | null>(null);

  const monthDays = useMemo(() => getMonthMatrix(selectedMonth), [selectedMonth]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await serviceOrderService.list();
      setOrders(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar ordens';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  }

  const scheduledEntries = useMemo(() => {
    const map = new Map<string, { count: number; hours: number }>();

    orders.forEach((order) => {
      if (!isVisibleOrder(order.status)) return;

      order.services.forEach((service) => {
        if (!service.scheduledDate) return;
        const date = new Date(service.scheduledDate);
        if (Number.isNaN(date.getTime())) return;
        const dateKey = toDateKey(date);

        const existing = map.get(dateKey) || { count: 0, hours: 0 };
        const shouldAccountHours = HOURS_ACCOUNTABLE_STATUSES.has(String(order.status).toUpperCase());
        const accountedHours = shouldAccountHours ? Number(service.estimatedHours || 0) : 0;

        map.set(dateKey, {
          count: existing.count + 1,
          hours: existing.hours + (Number.isFinite(accountedHours) ? accountedHours : 0),
        });
      });
    });

    return map;
  }, [orders]);

  const monthScheduledCount = useMemo(() => {
    let sum = 0;
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    scheduledEntries.forEach((value, dateKey) => {
      const date = new Date(`${dateKey}T00:00:00`);
      if (date.getFullYear() === year && date.getMonth() === month) sum += value.count;
    });
    return sum;
  }, [scheduledEntries, selectedMonth]);

  const monthAccountedHours = useMemo(() => {
    let sum = 0;
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    scheduledEntries.forEach((value, dateKey) => {
      const date = new Date(`${dateKey}T00:00:00`);
      if (date.getFullYear() === year && date.getMonth() === month) sum += value.hours;
    });
    return sum;
  }, [scheduledEntries, selectedMonth]);

  const selectedDayEntries = useMemo(() => {
    const dayEntries: Array<{ order: ServiceOrder; serviceIndex: number; service: any }> = [];
    if (!selectedDate) return dayEntries;

    orders.forEach((order) => {
      if (!isVisibleOrder(order.status)) return;

      order.services.forEach((service, serviceIndex) => {
        if (!service.scheduledDate) return;
        const date = new Date(service.scheduledDate);
        if (!Number.isNaN(date.getTime()) && toDateKey(date) === selectedDate) {
          dayEntries.push({ order, serviceIndex, service });
        }
      });
    });

    return dayEntries;
  }, [orders, selectedDate]);

  const unscheduledEntries = useMemo(() => {
    const entries: Array<{ order: ServiceOrder; serviceIndex: number; service: any }> = [];

    orders.forEach((order) => {
      if (!isVisibleOrder(order.status)) return;

      order.services.forEach((service, serviceIndex) => {
        if (!service.scheduledDate) {
          entries.push({ order, serviceIndex, service });
        }
      });
    });

    return entries;
  }, [orders]);

  async function handleSaveTime(orderId: string, serviceIndex: number, value: string, note: string) {
    const hours = Number(value);
    if (Number.isNaN(hours) || hours < 0) {
      Alert.alert('Erro', 'Informe uma quantidade válida de horas.');
      return;
    }

    setSavingIndex(`${orderId}-${serviceIndex}`);

    try {
      await serviceOrderService.updateServiceTime(orderId, serviceIndex, {
        timeSpentHours: hours,
        timeSpentDate: selectedDate || undefined,
        timeNotes: note,
      });
      await loadOrders();
      Alert.alert('Sucesso', 'Tempo registrado com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível registrar o tempo.';
      Alert.alert('Erro', message);
    } finally {
      setSavingIndex(null);
    }
  }

  async function handleSaveSchedule(orderId: string, serviceIndex: number, possibleDates: string[], scheduledDate: string | null) {
    setSavingIndex(`${orderId}-${serviceIndex}`);
    try {
      await serviceOrderService.updateServiceSchedule(orderId, serviceIndex, {
        possibleDates,
        scheduledDate,
      });
      await loadOrders();
      Alert.alert('Sucesso', 'Agendamento atualizado com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar o agendamento.';
      Alert.alert('Erro', message);
    } finally {
      setSavingIndex(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão de tempo</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {!selectedDate ? (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Serviços agendados no mês</Text>
                <Text style={styles.summaryValue}>{monthScheduledCount} serviços</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Horas contabilizadas no mês</Text>
                <Text style={styles.summaryValue}>{monthAccountedHours.toFixed(1)}h</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Selecionado</Text>
                <Text style={styles.summaryValue}>Nenhum dia</Text>
              </View>
            </View>

            <View style={styles.monthBar}>
              <TouchableOpacity onPress={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}>
                <Text style={styles.navText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</Text>
              <TouchableOpacity onPress={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}>
                <Text style={styles.navText}>▶</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {WEEK_DAYS.map((day) => (
                <Text key={day} style={styles.weekday}>{day}</Text>
              ))}

              {monthDays.map((cell) => {
                const key = cell.key;
                const value = scheduledEntries.get(key);

                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.dayCell, !cell.inMonth && styles.dayCellMuted]}
                    onPress={() => setSelectedDate(key)}
                  >
                    <Text style={[styles.dayNumber, !cell.inMonth && styles.dayNumberMuted]}>
                      {cell.date.getDate()}
                    </Text>
                    {!!value?.count && <Text style={styles.dayHour}>{value.count} serviço(s)</Text>}
                    {!!value?.hours && <Text style={styles.dayHoursAccounted}>{value.hours.toFixed(1)}h</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            {!loading && unscheduledEntries.length > 0 && (
              <View style={styles.daySection}>
                <Text style={styles.sectionTitle}>Serviços sem data definida</Text>
                {unscheduledEntries.map(({ order, serviceIndex, service }) => (
                  <TimeEntryRow
                    key={`unscheduled-${order._id}-${serviceIndex}`}
                    order={order}
                    serviceIndex={serviceIndex}
                    service={service}
                    selectedDate={selectedDate}
                    savingIndex={savingIndex}
                    onSave={handleSaveTime}
                    onSaveSchedule={handleSaveSchedule}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.daySection}>
            <View style={styles.dayHeaderRow}>
              <Text style={styles.sectionTitle}>Serviços para {toDisplayDate(`${selectedDate}T00:00:00`)}</Text>
              <TouchableOpacity style={styles.backButton} onPress={() => setSelectedDate(null)}>
                <Text style={styles.backButtonText}>Voltar ao calendário</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <Text style={styles.emptyText}>Carregando...</Text>
            ) : selectedDayEntries.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum serviço agendado para este dia.</Text>
            ) : (
              selectedDayEntries.map(({ order, serviceIndex, service }) => (
                <TimeEntryRow
                  key={`${order._id}-${serviceIndex}`}
                  order={order}
                  serviceIndex={serviceIndex}
                  service={service}
                  selectedDate={selectedDate}
                  savingIndex={savingIndex}
                  onSave={handleSaveTime}
                  onSaveSchedule={handleSaveSchedule}
                />
              ))
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

function TimeEntryRow({
  order,
  service,
  serviceIndex,
  selectedDate,
  savingIndex,
  onSave,
  onSaveSchedule,
}: {
  order: ServiceOrder;
  service: any;
  serviceIndex: number;
  selectedDate: string | null;
  savingIndex: string | null;
  onSave: (orderId: string, serviceIndex: number, value: string, note: string) => void;
  onSaveSchedule: (orderId: string, serviceIndex: number, possibleDates: string[], scheduledDate: string | null) => void;
}) {
  const [timeInput, setTimeInput] = useState(String(service.timeSpentHours || 0));
  const [noteInput, setNoteInput] = useState(service.timeNotes || '');
  const [possibleDatesInput, setPossibleDatesInput] = useState(
    (service.possibleDates || []).map((date: string) => String(date).slice(0, 10)).join(', ')
  );
  const [scheduledDateInput, setScheduledDateInput] = useState(
    service.scheduledDate ? String(service.scheduledDate).slice(0, 10) : ''
  );

  return (
    <View style={styles.serviceCard}>
      <Text style={styles.orderTitle}>{order.sequence ? `OS-${String(order.sequence).padStart(3, '0')}` : order._id.slice(-6)}</Text>
      <Text style={styles.serviceName}>{service.description}</Text>
      <Text style={styles.serviceMeta}>
        Estimado: {service.estimatedHours || 0}h · Agendado: {service.scheduledDate ? toDisplayDate(String(service.scheduledDate)) : 'Sem data'}
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={timeInput}
          onChangeText={setTimeInput}
          placeholder="Horas gastas"
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSave(order._id, serviceIndex, timeInput, noteInput)}
          disabled={savingIndex === `${order._id}-${serviceIndex}`}
        >
          <Text style={styles.saveButtonText}>
            {savingIndex === `${order._id}-${serviceIndex}` ? 'Salvando...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.noteInput}
        value={noteInput}
        onChangeText={setNoteInput}
        placeholder="Observação do tempo gasto"
        multiline
      />

      <View style={styles.scheduleSection}>
        <Text style={styles.scheduleLabel}>Agendar nova data:</Text>
        <TextInput
          style={styles.scheduleInput}
          value={scheduledDateInput}
          onChangeText={setScheduledDateInput}
          placeholder="Data agendada"
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            const possibleDates = possibleDatesInput
              .split(',')
              .map((date: string) => date.trim())
              .filter((date: string) => date.length > 0);
            onSaveSchedule(order._id, serviceIndex, possibleDates, scheduledDateInput.trim() || null);
          }}
          disabled={savingIndex === `${order._id}-${serviceIndex}`}
        >
          <Text style={styles.saveButtonText}>
            {savingIndex === `${order._id}-${serviceIndex}` ? 'Salvando...' : 'Salvar agendamento'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.possibleDatesSection}>
        <Text style={styles.possibleDatesLabel}>Possíveis datas:</Text>
        <TextInput
          style={styles.possibleDatesInput}
          value={possibleDatesInput}
          onChangeText={setPossibleDatesInput}
          placeholder="Datas possíveis (AAAA-MM-DD, separadas por vírgula)"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14213d',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  summaryBox: {
    minWidth: '30%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'capitalize',
  },
  navText: {
    fontSize: 22,
    color: '#0f172a',
    paddingHorizontal: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  weekday: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    color: '#475569',
    paddingVertical: 8,
    fontWeight: '600',
  },
  dayCell: {
    width: '14.28%',
    minHeight: 72,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#edf2f7',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellMuted: {
    opacity: 0.45,
  },
  dayCellSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#60a5fa',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  dayNumberMuted: {
    color: '#94a3b8',
  },
  dayNumberSelected: {
    color: '#1d4ed8',
  },
  dayHour: {
    marginTop: 6,
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '700',
  },
  dayHoursAccounted: {
    marginTop: 3,
    fontSize: 11,
    color: '#0f766e',
    fontWeight: '700',
  },
  daySection: {
    padding: 16,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  backButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: 12,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '700',
  },
  serviceName: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  serviceMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dfe7f1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0f172a',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  noteInput: {
    marginTop: 12,
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#dfe7f1',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
    color: '#0f172a',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
  },
  scheduleSection: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dfe7f1',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  scheduleInput: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#dfe7f1',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#0f172a',
  },
  possibleDatesSection: {
    marginTop: 12,
  },
  possibleDatesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  possibleDatesInput: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#dfe7f1',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#0f172a',
  },
});
