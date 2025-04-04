import { type Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import * as Mollitia from 'mollitia';
import * as MollitiaPrometheus from '@mollitia/prometheus';

Mollitia.use(new MollitiaPrometheus.PrometheusAddon());

export default {
  extends: DefaultTheme
} satisfies Theme;
