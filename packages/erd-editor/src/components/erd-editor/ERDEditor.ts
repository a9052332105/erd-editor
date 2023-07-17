import {
  defineCustomElement,
  FC,
  html,
  observable,
  useProvider,
} from '@dineug/r-html';

import { appContext, createAppContext } from '@/components/context';
import ERD from '@/components/erd/ERD';
import { createDarkTheme } from '@/themes/darkTheme';
import { themeToTokensString } from '@/themes/tokens';

import * as styles from './ERDEditor.styles';

declare global {
  interface HTMLElementTagNameMap {
    'erd-editor': ERDEditorElement;
  }
}

export type ERDEditorProps = {};

export interface ERDEditorElement extends ERDEditorProps, HTMLElement {}

const ERDEditor: FC<ERDEditorProps, ERDEditorElement> = (props, ctx) => {
  const appContextValue = createAppContext();
  const provider = useProvider(ctx, appContext, appContextValue);
  const state = observable({ theme: createDarkTheme() }, { shallow: true });

  return () => html`
    <style type="text/css">
      :host {
        ${themeToTokensString(state.theme)}
      }
    </style>
    <div class=${styles.warp}>
      <${ERD} />
    </div>
  `;
};

defineCustomElement('erd-editor', {
  render: ERDEditor,
});
