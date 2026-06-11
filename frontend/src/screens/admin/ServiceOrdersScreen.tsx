import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { serviceOrderService } from '../../services/serviceOrder.service';

type ServiceOrderStatus = 'ORCAMENTO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO';

interface ServiceItem {
  description: string;
  estimatedHours: number;
  price: number;
}

interface MaterialUsage {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unitCost: number;
}

interface ServiceOrder {
  rawId: string;
  id: string;
  clientId: string;
  clientName: string;
  clientCpf?: string;
  vehicleId: string;
  vehicleLabel: string;
  status: ServiceOrderStatus;
  services: ServiceItem[];
  materials: MaterialUsage[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes: string;
  createdAt: string;
  approvedAt: string;
  startedAt: string;
  finishedAt: string;
  updatedAt: string;
}

interface StatusCfg {
  label: string;
  bg: string;
  textColor: string;
  dot: string;
}

const STATUS_CONFIG: Record<ServiceOrderStatus, StatusCfg> = {
  ORCAMENTO:   { label: 'Orçamento',   bg: '#F1EFE8', textColor: '#444441', dot: '#888780' },
  APROVADO:    { label: 'Aprovado',    bg: '#E6F1FB', textColor: '#0C447C', dot: '#185FA5' },
  EM_EXECUCAO: { label: 'Em execução', bg: '#FAEEDA', textColor: '#633806', dot: '#BA7517' },
  CONCLUIDO:   { label: 'Concluído',   bg: '#EAF3DE', textColor: '#27500A', dot: '#3B6D11' },
};

const STATUS_FLOW: ServiceOrderStatus[] = ['ORCAMENTO', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO'];

const NEXT_STATUS: Partial<Record<ServiceOrderStatus, ServiceOrderStatus>> = {
  ORCAMENTO:   'APROVADO',
  APROVADO:    'EM_EXECUCAO',
  EM_EXECUCAO: 'CONCLUIDO',
};

const NEXT_LABEL: Partial<Record<ServiceOrderStatus, string>> = {
  ORCAMENTO:   'Aprovar orçamento',
  APROVADO:    'Iniciar execução',
  EM_EXECUCAO: 'Concluir OS',
};

function brl(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateTime(dateString?: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('pt-BR');
}

function toUiOrder(order: any): ServiceOrder {
  const client = order.clientId && typeof order.clientId === 'object' ? order.clientId : null;
  const machine = order.machineId && typeof order.machineId === 'object' ? order.machineId : null;
  const orderNumber = order.sequence ? `OS-${String(order.sequence).padStart(3, '0')}` : `OS-${String(order._id).slice(-8)}`;

  return {
    rawId: String(order._id),
    id: orderNumber,
    clientId: String(client?._id ?? order.clientId ?? ''),
    clientName: client?.name || client?.document || 'Cliente não identificado',
    clientCpf: client?.document || '',
    vehicleId: String(machine?._id ?? order.machineId ?? ''),
    vehicleLabel: machine?.name || 'Máquina não identificada',
    status: order.status,
    services: order.services || [],
    materials: order.materials || [],
    laborCost: order.laborCost || 0,
    partsCost: order.partsCost || 0,
    totalCost: order.totalCost || 0,
    notes: order.notes || '',
    createdAt: formatDateTime(order.createdAt),
    approvedAt: formatDateTime(order.approvedAt),
    startedAt: formatDateTime(order.startedAt),
    finishedAt: formatDateTime(order.finishedAt),
    updatedAt: formatDateTime(order.updatedAt),
  };
}

export default function ServiceOrdersScreen() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<ServiceOrderStatus | 'all'>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setError(null);
      const response = await serviceOrderService.list();
      setOrders(response.map((order: any) => toUiOrder(order)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar ordens de serviço';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  const openCount = orders.filter((o) => o.status !== 'CONCLUIDO').length;
  const monthRevenue = orders.filter((o) => o.status === 'CONCLUIDO').reduce((a, o) => a + o.totalCost, 0);
  const concludedCount = orders.filter((o) => o.status === 'CONCLUIDO').length;

  const filtered = useMemo<ServiceOrder[]>(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      const matchSearch = q === '' || o.clientName.toLowerCase().includes(q) || o.vehicleLabel.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || (o.clientCpf || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, search]);

  async function advanceStatus(id: string): Promise<void> {
    const current = orders.find((x) => x.id === id);
    if (current === undefined) return;

    const next = NEXT_STATUS[current.status];
    if (next === undefined) return;

    const rawId = current.rawId;
    if (!rawId) return;

    const updated = await serviceOrderService.updateStatus(rawId, next);
    const mapped = toUiOrder(updated as any);
    setOrders((prev) => prev.map((o) => (o.id === id ? mapped : o)));
  }

  function handleAdvance(id: string): void {
    const o = orders.find((x) => x.id === id);
    if (o === undefined) return;
    const next = NEXT_STATUS[o.status];
    if (next === undefined) return;
    Alert.alert(
      NEXT_LABEL[o.status] ?? 'Avançar status',
      `Confirmar: ${o.id} → ${STATUS_CONFIG[next].label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: async () => { await advanceStatus(id); } },
      ]
    );
  }

  return (
    <View style={s.root}>
      <View style={s.topbar}>
        <View>
          <Text style={s.topbarTitle}>Ordens de serviço</Text>
          <Text style={s.topbarSub}>{orders.length} ordens carregadas</Text>
        </View>
        <TouchableOpacity style={s.btnNew} onPress={() => Alert.alert('Nova OS', 'Abrir formulário.')} activeOpacity={0.7}>
          <Text style={s.btnNewText}>+ Nova OS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtersRow}>
        {(['all', ...STATUS_FLOW] as const).map((st) => {
          const label = st === 'all' ? 'Todas' : STATUS_CONFIG[st as ServiceOrderStatus].label;
          const active = filterStatus === st;
          return (
            <TouchableOpacity
              key={st}
              style={[s.chip, active && s.chipActive]}
              onPress={() => setFilterStatus(st as typeof filterStatus)}
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar cliente, placa ou nº..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={s.metricsRow}>
        <View style={s.metricCard}>
          <Text style={s.metricLabel}>Em aberto</Text>
          <Text style={s.metricVal}>{openCount}</Text>
          <Text style={s.metricSub}>ordens ativas</Text>
        </View>
        <View style={s.metricCard}>
          <Text style={s.metricLabel}>Faturado (mês)</Text>
          <Text style={s.metricVal}>{brl(monthRevenue)}</Text>
          <Text style={s.metricSub}>{concludedCount} concluídas</Text>
        </View>
      </View>

      <Text style={s.sectionLabel}>Recentes</Text>

      {error && (
        <View style={s.errorWrap}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadOrders}>
            <Text style={s.errorAction}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList<ServiceOrder>
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={isLoading ? <View style={s.emptyWrap}><Text style={s.emptyText}>Carregando...</Text></View> : <View style={s.emptyWrap}><Text style={s.emptyText}>Nenhuma ordem encontrada</Text></View>}
        renderItem={({ item }) => (
          <OSCard order={item} onPress={() => { setSelectedId(item.id); setDetailVisible(true); }} />
        )}
        onRefresh={() => {
          setIsRefreshing(true);
          loadOrders();
        }}
        refreshing={isRefreshing}
      />

      <Modal
        visible={detailVisible}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => setDetailVisible(false)}
      >
        {selectedOrder !== null && (
          <OrderDetail
            order={selectedOrder}
            onClose={() => setDetailVisible(false)}
            onAdvance={() => handleAdvance(selectedOrder.id)}
          />
        )}
      </Modal>
    </View>
  );
}

interface OSCardProps { order: ServiceOrder; onPress: () => void; }

function OSCard({ order, onPress }: OSCardProps) {
  const sc = STATUS_CONFIG[order.status];
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.cardTop}>
        <View>
          <Text style={s.cardId}>{order.id}</Text>
          <Text style={s.cardDate}>{order.createdAt}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: sc.bg }]}>
          <Text style={[s.badgeText, { color: sc.textColor }]}>{sc.label}</Text>
        </View>
      </View>
      <Text style={s.cardClient}>{order.clientName}</Text>
      <Text style={s.cardVehicle}>{order.vehicleLabel}</Text>
      <View style={s.cardFooter}>
        <Text style={s.cardSvc}>{order.services.length} serviço{order.services.length !== 1 ? 's' : ''}</Text>
        <Text style={s.cardTotal}>{order.totalCost > 0 ? brl(order.totalCost) : '—'}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface OrderDetailProps { order: ServiceOrder; onClose: () => void; onAdvance: () => void; }

function OrderDetail({ order, onClose, onAdvance }: OrderDetailProps) {
  const sc = STATUS_CONFIG[order.status];
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const canAdvance = order.status !== 'CONCLUIDO';
  const tldates: string[] = [order.createdAt, order.approvedAt, order.startedAt, order.finishedAt];

  return (
    <View style={s.detailRoot}>
      <View style={s.detailHeader}>
        <TouchableOpacity onPress={onClose} style={s.backBtn}>
          <Text style={s.backBtnText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={s.detailHeaderCenter}>
          <Text style={s.detailTitle}>{order.id}</Text>
          <Text style={s.detailSub}>Aberta em {order.createdAt}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: sc.bg }]}>
          <Text style={[s.badgeText, { color: sc.textColor }]}>{sc.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.detailBody} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>Cliente &amp; veículo</Text>
        <View style={s.detailCard}>
          <Row label="Cliente" value={order.clientName} />
          <Row label="Veículo" value={order.vehicleLabel} />
          {order.notes !== '' && <Row label="Obs." value={order.notes} />}
        </View>

        <Text style={s.sectionLabel}>Histórico de status</Text>
        <View style={s.tlWrap}>
          {STATUS_FLOW.map((st, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            const dotColor = done ? '#3B6D11' : active ? STATUS_CONFIG[st].dot : '#D3D1C7';
            const lineColor = i < currentIdx ? '#3B6D11' : '#D3D1C7';
            const dateStr = tldates[i] !== '' ? tldates[i] : active ? 'Em andamento' : 'Aguardando';
            return (
              <View key={st} style={s.tlRow}>
                <View style={s.tlLeft}>
                  <View style={[s.tlDot, { backgroundColor: dotColor }]} />
                  {i < STATUS_FLOW.length - 1 && <View style={[s.tlLine, { backgroundColor: lineColor }]} />}
                </View>
                <View style={s.tlContent}>
                  <Text style={s.tlLabel}>{STATUS_CONFIG[st].label}</Text>
                  <Text style={s.tlDate}>{dateStr}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={s.sectionLabel}>Serviços ({order.services.length})</Text>
        {order.services.map((sv, i) => (
          <View key={i} style={s.svcItem}>
            <Text style={s.svcName}>{sv.description}</Text>
            <Text style={s.svcMeta}>{sv.estimatedHours}h estimadas · {brl(sv.price)}</Text>
          </View>
        ))}

        <Text style={s.sectionLabel}>Materiais</Text>
        {order.materials.length > 0 ? (
          <View style={s.detailCard}>
            {order.materials.map((m, i) => (
              <Row key={i} label={m.name} value={`${m.quantity}x · ${brl(m.unitCost)}`} />
            ))}
          </View>
        ) : (
          <Text style={[s.emptyText, { marginHorizontal: 16 }]}>Nenhum material registrado</Text>
        )}

        <Text style={s.sectionLabel}>Custos</Text>
        <View style={s.costsRow}>
          <View style={s.costCard}>
            <Text style={s.costLabel}>Mão de obra</Text>
            <Text style={s.costVal}>{order.laborCost > 0 ? brl(order.laborCost) : '—'}</Text>
          </View>
          <View style={s.costCard}>
            <Text style={s.costLabel}>Peças</Text>
            <Text style={s.costVal}>{order.partsCost > 0 ? brl(order.partsCost) : '—'}</Text>
          </View>
        </View>
        <View style={s.costTotal}>
          <Text style={s.costTotalLabel}>Total</Text>
          <Text style={s.costTotalVal}>{order.totalCost > 0 ? brl(order.totalCost) : 'A calcular'}</Text>
        </View>

        <TouchableOpacity
          style={[s.advanceBtn, !canAdvance && s.advanceBtnDone]}
          onPress={canAdvance ? onAdvance : undefined}
          activeOpacity={canAdvance ? 0.8 : 1}
        >
          <Text style={[s.advanceBtnText, !canAdvance && s.advanceBtnTextDone]}>
            {canAdvance ? `${NEXT_LABEL[order.status] ?? 'Avançar'} →` : 'OS finalizada ✓'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.detailRow}>
      <Text style={s.detailRowLabel}>{label}</Text>
      <Text style={s.detailRowVal} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const C = {
  bg:         '#FFFFFF',
  surf:       '#F7F7F5',
  page:       '#F1EFE8',
  border:     'rgba(0,0,0,0.10)',
  borderMed:  'rgba(0,0,0,0.18)',
  text:       '#1A1A1A',
  muted:      '#666666',
  faint:      '#999999',
  blue:       '#185FA5',
  blueLight:  '#E6F1FB',
  blueDark:   '#0C447C',
};

const s = StyleSheet.create({
  root:             { flex: 1, backgroundColor: C.page },
  topbar:           { backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: C.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topbarTitle:      { fontSize: 17, fontWeight: '600', color: C.text },
  topbarSub:        { fontSize: 12, color: C.muted, marginTop: 2 },
  btnNew:           { borderWidth: 0.5, borderColor: C.borderMed, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: C.bg },
  btnNewText:       { fontSize: 13, fontWeight: '500', color: C.text },
  filtersRow:       { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.bg, borderBottomWidth: 0.5, borderBottomColor: C.border, gap: 8 },
  chip:             { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: C.border, backgroundColor: C.surf },
  chipActive:       { backgroundColor: C.blue, borderColor: C.blue },
  chipText:         { fontSize: 12, fontWeight: '500', color: C.muted },
  chipTextActive:   { color: C.blueLight },
  searchWrap:       { paddingHorizontal: 16, paddingTop: 12 },
  searchInput:      { backgroundColor: C.bg, borderWidth: 0.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: C.text },
  metricsRow:       { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 8 },
  metricCard:       { flex: 1, backgroundColor: C.surf, borderRadius: 10, padding: 12 },
  metricLabel:      { fontSize: 11, color: C.muted, marginBottom: 4 },
  metricVal:        { fontSize: 20, fontWeight: '600', color: C.text },
  metricSub:        { fontSize: 11, color: C.faint, marginTop: 2 },
  sectionLabel:     { fontSize: 11, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  listContent:      { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  emptyWrap:        { paddingVertical: 32, alignItems: 'center' },
  emptyText:        { color: C.faint, fontSize: 13 },
  card:             { backgroundColor: C.bg, borderRadius: 12, borderWidth: 0.5, borderColor: C.border, padding: 14 },
  cardTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardId:           { fontSize: 13, fontWeight: '600', color: C.text },
  cardDate:         { fontSize: 11, color: C.faint },
  cardClient:       { fontSize: 14, fontWeight: '500', color: C.text, marginBottom: 2 },
  cardVehicle:      { fontSize: 12, color: C.muted },
  cardFooter:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: C.border },
  cardSvc:          { fontSize: 12, color: C.faint },
  cardTotal:        { fontSize: 14, fontWeight: '600', color: C.text },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:        { fontSize: 11, fontWeight: '600' },
  detailRoot:       { flex: 1, backgroundColor: C.bg },
  detailHeader:     { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 0.5, borderBottomColor: C.border, gap: 10 },
  backBtn:          { paddingRight: 4 },
  backBtnText:      { fontSize: 14, color: C.blue, fontWeight: '500' },
  detailHeaderCenter: { flex: 1 },
  detailTitle:      { fontSize: 15, fontWeight: '600', color: C.text },
  detailSub:        { fontSize: 12, color: C.muted },
  detailBody:       { paddingBottom: 24 },
  detailCard:       { marginHorizontal: 16, backgroundColor: C.bg, borderRadius: 10, borderWidth: 0.5, borderColor: C.border, paddingHorizontal: 14 },
  detailRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: C.border },
  detailRowLabel:   { fontSize: 13, color: C.muted, flex: 1 },
  detailRowVal:     { fontSize: 13, fontWeight: '500', color: C.text, flex: 2, textAlign: 'right' },
  tlWrap:           { marginHorizontal: 16 },
  tlRow:            { flexDirection: 'row', alignItems: 'flex-start' },
  tlLeft:           { alignItems: 'center', width: 24 },
  tlDot:            { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  tlLine:           { width: 1, flex: 1, minHeight: 28 },
  tlContent:        { flex: 1, paddingBottom: 16, paddingLeft: 8 },
  tlLabel:          { fontSize: 13, fontWeight: '500', color: C.text },
  tlDate:           { fontSize: 11, color: C.faint, marginTop: 1 },
  svcItem:          { marginHorizontal: 16, backgroundColor: C.surf, borderRadius: 10, padding: 12, marginBottom: 6 },
  svcName:          { fontSize: 13, fontWeight: '500', color: C.text },
  svcMeta:          { fontSize: 11, color: C.muted, marginTop: 2 },
  costsRow:         { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 8 },
  costCard:         { flex: 1, backgroundColor: C.surf, borderRadius: 10, padding: 12 },
  costLabel:        { fontSize: 11, color: C.muted },
  costVal:          { fontSize: 16, fontWeight: '600', color: C.text, marginTop: 4 },
  costTotal:        { marginHorizontal: 16, backgroundColor: C.blueLight, borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  costTotalLabel:   { fontSize: 13, fontWeight: '600', color: C.blueDark },
  costTotalVal:     { fontSize: 18, fontWeight: '600', color: C.blueDark },
  advanceBtn:       { marginHorizontal: 16, marginTop: 16, backgroundColor: C.blue, borderRadius: 10, padding: 14, alignItems: 'center' },
  advanceBtnDone:   { backgroundColor: C.surf },
  advanceBtnText:   { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  advanceBtnTextDone: { color: C.faint },
});
