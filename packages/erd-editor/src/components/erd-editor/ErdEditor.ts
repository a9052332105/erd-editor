import {
  createRef,
  defineCustomElement,
  FC,
  html,
  onMounted,
  ref,
  useProvider,
} from '@dineug/r-html';
import { fromEvent, throttleTime } from 'rxjs';

import { appContext, createAppContext } from '@/components/appContext';
import Erd from '@/components/erd/Erd';
import GlobalStyles from '@/components/global-styles/GlobalStyles';
import Theme from '@/components/theme/Theme';
import Toolbar from '@/components/toolbar/Toolbar';
import { TOOLBAR_HEIGHT } from '@/constants/layout';
import { DatabaseVendor } from '@/constants/sql/database';
import { changeViewportAction } from '@/engine/modules/editor/atom.actions';
import { useKeyBindingMap } from '@/hooks/useKeyBindingMap';
import { useUnmounted } from '@/hooks/useUnmounted';
import { ThemeOptions } from '@/themes/radix-ui-theme';
import { Theme as ThemeType } from '@/themes/tokens';
import { focusEvent, forceFocusEvent } from '@/utils/internalEvents';
import { KeyBindingMap, KeyBindingName } from '@/utils/keyboard-shortcut';
import { createText } from '@/utils/text';

import * as styles from './ErdEditor.styles';
import { useErdEditorAttachElement } from './useErdEditorAttachElement';

declare global {
  interface HTMLElementTagNameMap {
    'erd-editor': ErdEditorElement;
  }
}

export type ErdEditorProps = {
  readonly: boolean;
  systemDarkMode: boolean;
};

export interface ErdEditorElement extends ErdEditorProps, HTMLElement {
  value: string;
  focus: () => void;
  blur: () => void;
  clear: () => void;
  setInitialValue: (value: string) => void;
  setPresetTheme: (themeOptions: Partial<ThemeOptions>) => void;
  setTheme: (theme: Partial<ThemeType>) => void;
  setKeyBindingMap: (
    keyBindingMap: Partial<
      Omit<
        KeyBindingMap,
        | typeof KeyBindingName.edit
        | typeof KeyBindingName.stop
        | typeof KeyBindingName.find
        | typeof KeyBindingName.undo
        | typeof KeyBindingName.redo
        | typeof KeyBindingName.zoomIn
        | typeof KeyBindingName.zoomOut
      >
    >
  ) => void;
  setSchemaSQL: (value: string) => void;
  getSchemaSQL: (databaseVendor?: DatabaseVendor) => string;
}

const ErdEditor: FC<ErdEditorProps, ErdEditorElement> = (props, ctx) => {
  const text = createText();
  const appContextValue = createAppContext({ toWidth: text.toWidth });
  useProvider(ctx, appContext, appContextValue);

  const root = createRef<HTMLDivElement>();
  useKeyBindingMap(ctx, root);

  const { theme } = useErdEditorAttachElement({
    props,
    ctx,
    app: appContextValue,
    root,
  });
  const { store, keydown$ } = appContextValue;
  const { addUnsubscribe } = useUnmounted();

  const handleKeydown = (event: KeyboardEvent) => {
    keydown$.next(event);
  };

  const handleFocus = () => {
    window.setTimeout(() => {
      if (document.activeElement !== ctx) {
        ctx.focus();
      }
    }, 1);
  };

  onMounted(() => {
    ctx.focus();
    addUnsubscribe(
      fromEvent(ctx, focusEvent.type)
        .pipe(throttleTime(50))
        .subscribe(handleFocus),
      fromEvent(ctx, forceFocusEvent.type).subscribe(ctx.focus)
    );
  });

  onMounted(() => {
    const $root = root.value;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        store.dispatch(
          changeViewportAction({ width, height: height - TOOLBAR_HEIGHT })
        );
      }
    });
    resizeObserver.observe($root);
    addUnsubscribe(() => {
      resizeObserver.unobserve($root);
      resizeObserver.disconnect();
    });
  });

  return () => html`
    <${GlobalStyles} />
    <${Theme} .theme=${theme} />
    <div
      ${ref(root)}
      class=${styles.root}
      tabindex="-1"
      @keydown=${handleKeydown}
    >
      <${Toolbar} />
      <div class=${styles.main}>
        <${Erd} />
      </div>
      ${text.span}
    </div>
  `;
};

defineCustomElement('erd-editor', {
  shadow: 'closed',
  observedProps: {
    readonly: Boolean,
    systemDarkMode: Boolean,
  },
  render: ErdEditor,
});
