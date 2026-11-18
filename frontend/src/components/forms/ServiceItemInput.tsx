import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TextInput } from '../common/TextInput';
import { ServiceItemInput as ServiceItemType } from '../../types/domain';

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthCells(referenceDate: Date) {
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

interface ServiceItemInputProps {
  value: ServiceItemType;
  onChange: (value: ServiceItemType) => void;
  onRemove: () => void;
  index: number;
  canRemove: boolean;
}

export function ServiceItemInput({
  value,
  onChange,
  onRemove,
  index,
  canRemove,
}: ServiceItemInputProps) {
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [errors, setErrors] = useState<{
    description?: string;
    estimatedHours?: string;
    price?: string;
  }>({});

  const monthCells = getMonthCells(calendarMonth);
  const selectedDates = new Set(value.possibleDates || []);

  const handleChange = (field: keyof ServiceItemType, text: string) => {
    const newValue = { ...value } as unknown as Record<string, unknown>;

    if (field === 'description') {
      newValue[field] = text;
    } else {
      const numValue = parseFloat(text) || 0;
      newValue[field] = numValue;
    }

    onChange(newValue as unknown as ServiceItemType);

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field as keyof typeof errors]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!value.description || value.description.trim() === '') {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (value.estimatedHours < 0) {
      newErrors.estimatedHours = 'Horas não podem ser negativas';
    }

    if (value.price < 0) {
      newErrors.price = 'Preço não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleDate = (dateKey: string) => {
    const nextDates = new Set(value.possibleDates || []);
    if (nextDates.has(dateKey)) {
      nextDates.delete(dateKey);
    } else {
      nextDates.add(dateKey);
    }

    onChange({
      ...value,
      possibleDates: Array.from(nextDates).sort(),
    });
  };

  return (
    <View className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-gray-900 font-semibold text-base">
          Serviço {index + 1}
        </Text>
        {canRemove && (
          <TouchableOpacity
            onPress={onRemove}
            className="bg-red-100 px-3 py-1 rounded"
          >
            <Text className="text-red-600 text-sm font-medium">Remover</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        label="Descrição do serviço"
        value={value.description}
        onChangeText={(text) => handleChange('description', text)}
        placeholder="Ex: Troca de óleo"
        error={errors.description}
        containerClassName="mb-3"
      />

      <View className="flex-row gap-3">
        <TextInput
          label="Horas estimadas"
          value={value.estimatedHours.toString()}
          onChangeText={(text) => handleChange('estimatedHours', text)}
          placeholder="0"
          keyboardType="numeric"
          error={errors.estimatedHours}
          containerClassName="flex-1"
        />

        <TextInput
          label="Preço (R$)"
          value={value.price.toString()}
          onChangeText={(text) => handleChange('price', text)}
          placeholder="0.00"
          keyboardType="numeric"
          error={errors.price}
          containerClassName="flex-1"
        />
      </View>

      <View className="mt-4 bg-white rounded-lg border border-gray-200 p-3">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-900 font-semibold">Datas possíveis</Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() =>
                setCalendarMonth(
                  new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                )
              }
              className="px-2 py-1"
            >
              <Text className="text-gray-700">◀</Text>
            </TouchableOpacity>
            <Text className="text-gray-700 font-medium mx-1 capitalize">
              {calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setCalendarMonth(
                  new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                )
              }
              className="px-2 py-1"
            >
              <Text className="text-gray-700">▶</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row flex-wrap">
          {WEEK_DAYS.map((day) => (
            <Text
              key={day}
              className="text-center text-xs text-gray-500 font-medium py-1"
              style={{ width: '14.28%' }}
            >
              {day}
            </Text>
          ))}

          {monthCells.map((cell) => {
            const isSelected = selectedDates.has(cell.key);
            return (
              <TouchableOpacity
                key={cell.key}
                onPress={() => toggleDate(cell.key)}
                style={{ width: '14.28%' }}
                className={`py-2 items-center border border-gray-100 ${
                  isSelected ? 'bg-blue-100 border-blue-300' : 'bg-white'
                }`}
              >
                <Text
                  className={`text-sm ${
                    !cell.inMonth
                      ? 'text-gray-300'
                      : isSelected
                      ? 'text-blue-700 font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  {cell.date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-3">
          <Text className="text-xs text-gray-500 mb-1">Selecionadas:</Text>
          <Text className="text-sm text-gray-700">
            {(value.possibleDates || []).length > 0
              ? (value.possibleDates || []).join(', ')
              : 'Nenhuma data selecionada'}
          </Text>
        </View>
      </View>
    </View>
  );
}
