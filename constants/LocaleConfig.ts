import { LocaleConfig } from 'react-native-calendars';

// Configure Portuguese-Brazilian locale for react-native-calendars
export const configurePortugueseBrazilianLocale = () => {
  LocaleConfig.locales['pt-BR'] = {
    monthNames: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro'
    ],
    monthNamesShort: [
      'Jan.',
      'Fev.',
      'Mar.',
      'Abr.',
      'Mai.',
      'Jun.',
      'Jul.',
      'Ago.',
      'Set.',
      'Out.',
      'Nov.',
      'Dez.'
    ],
    dayNames: [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ],
    dayNamesShort: [
      'Dom.',
      'Seg.',
      'Ter.',
      'Qua.',
      'Qui.',
      'Sex.',
      'Sáb.'
    ],
    today: 'Hoje'
  };

  // Set Portuguese-Brazilian as default locale
  LocaleConfig.defaultLocale = 'pt-BR';
};

// Export the locale key for use in components
export const PORTUGUESE_BRAZILIAN_LOCALE = 'pt-BR';
