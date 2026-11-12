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

export default function TimeManagementScreen() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
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
    const map = new Map<string, number>();

    orders.forEach((order) => {
      order.services.forEach((service) => {
        const value = Number(service.timeSpentHours || 0);
        const dateKey = service.timeSpentDate ? new Date(service.timeSpentDate).toISOString().slice(0, 10) : null;
        if (value > 0 && dateKey) {
          map.set(dateKey, (map.get(dateKey) || 0) + value);
        }
      });
    });

    return map;
  }, [orders]);

  const selectedDayEntries = useMemo(() => {
    const dayEntries: Array<{ order: ServiceOrder; serviceIndex: number; service: any }> = [];

    orders.forEach((order) => {
      order.services.forEach((service, serviceIndex) => {
        const dateKey = service.timeSpentDate ? new Date(service.timeSpentDate).toISOString().slice(0, 10) : null;
        if (dateKey === selectedDate) {
          dayEntries.push({ order, serviceIndex, service });
        }
      });
    });

    return dayEntries;
  }, [orders, selectedDate]);

  const monthTotalHours = useMemo(() => {
    let sum = 0;
    scheduledEntries.forEach((value) => {
      sum += value;
    });
    return sum;
  }, [scheduledEntries]);

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
        timeSpentDate: selectedDate,
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão de tempo</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Horas do mês</Text>
          <Text style={styles.summaryValue}>{monthTotalHours.toFixed(1)}h</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Selecionado</Text>
          <Text style={styles.summaryValue}>{toDisplayDate(`${selectedDate}T00:00:00`)}</Text>
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
          const value = scheduledEntries.get(key) || 0;
          const isSelected = key === selectedDate;

          return (
            <TouchableOpacity
              key={key}
              style={[styles.dayCell, !cell.inMonth && styles.dayCellMuted, isSelected && styles.dayCellSelected]}
              onPress={() => setSelectedDate(key)}
            >
              <Text style={[styles.dayNumber, !cell.inMonth && styles.dayNumberMuted, isSelected && styles.dayNumberSelected]}>
                {cell.date.getDate()}
              </Text>
              {value > 0 && <Text style={styles.dayHour}>{value.toFixed(1)}h</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.daySection}>
        <Text style={styles.sectionTitle}>Serviços para {toDisplayDate(`${selectedDate}T00:00:00`)}</Text>

        {loading ? (
          <Text style={styles.emptyText}>Carregando...</Text>
        ) : selectedDayEntries.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum tempo registrado para este dia.</Text>
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
            />
          ))
        )}
      </View>
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
}: {
  order: ServiceOrder;
  service: any;
  serviceIndex: number;
  selectedDate: string;
  savingIndex: string | null;
  onSave: (orderId: string, serviceIndex: number, value: string, note: string) => void;
}) {
  const [timeInput, setTimeInput] = useState(String(service.timeSpentHours || 0));
  const [noteInput, setNoteInput] = useState(service.timeNotes || '');

  return (
    <View style={styles.serviceCard}>
      <Text style={styles.orderTitle}>{order.sequence ? `OS-${String(order.sequence).padStart(3, '0')}` : order._id.slice(-6)}</Text>
      <Text style={styles.serviceName}>{service.description}</Text>
      <Text style={styles.serviceMeta}>Estimado: {service.estimatedHours || 0}h · {selectedDate}</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
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
    padding: 16,
    gap: 12,
  },
  summaryBox: {
    flex: 1,
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
  daySection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
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
});
