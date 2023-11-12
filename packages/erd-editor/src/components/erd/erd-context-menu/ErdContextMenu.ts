import { FC, html, Ref } from '@dineug/r-html';

import { useAppContext } from '@/components/appContext';
import ContextMenu from '@/components/primitives/context-menu/ContextMenu';
import Icon from '@/components/primitives/icon/Icon';
import Kbd from '@/components/primitives/kbd/Kbd';
import { addMemoAction$ } from '@/engine/modules/memo/generator.actions';
import { addTableAction$ } from '@/engine/modules/table/generator.actions';
import { ValuesType } from '@/internal-types';

import { createDatabaseMenus } from './databaseMenus';
import { createDrawRelationshipMenus } from './drawRelationshipMenus';
import { createExportMenus } from './exportMenus';
import { createImportMenus } from './importMenus';
import { createShowMenus } from './showMenus';

export const ErdContextMenuType = {
  ERD: 'ERD',
  table: 'table',
  relationship: 'relationship',
} as const;
export type ErdContextMenuType = ValuesType<typeof ErdContextMenuType>;

export type ErdContextMenuProps = {
  type: ErdContextMenuType;
  root: Ref<HTMLDivElement>;
  onClose: () => void;
};

const ErdContextMenu: FC<ErdContextMenuProps> = (props, ctx) => {
  const app = useAppContext(ctx);

  const handleAddTable = () => {
    const { store } = app.value;
    store.dispatch(addTableAction$());
    props.onClose();
  };

  const handleAddMemo = () => {
    const { store } = app.value;
    store.dispatch(addMemoAction$());
    props.onClose();
  };

  const handleAutomaticTablePlacement = () => {
    // TODO: automaticTablePlacement
    console.log('automaticTablePlacement');
    props.onClose();
  };

  const chevronRightIcon = html`<${Icon} name="chevron-right" size=${14} />`;

  return () => {
    const { keyBindingMap } = app.value;

    return props.type === ErdContextMenuType.table
      ? html``
      : props.type === ErdContextMenuType.relationship
      ? html``
      : html`
          <${ContextMenu.Root}
            children=${html`
              <${ContextMenu.Item}
                .onClick=${handleAddTable}
                children=${html`
                  <${ContextMenu.Menu}
                    icon=${html`<${Icon} name="table" size=${14} />`}
                    name="New Table"
                    right=${html`
                      <${Kbd} shortcut=${keyBindingMap.addTable[0]?.shortcut} />
                    `}
                  />
                `}
              />
              <${ContextMenu.Item}
                .onClick=${handleAddMemo}
                children=${html`
                  <${ContextMenu.Menu}
                    icon=${html`<${Icon} name="note-sticky" size=${14} />`}
                    name="New Memo"
                    right=${html`
                      <${Kbd} shortcut=${keyBindingMap.addMemo[0]?.shortcut} />
                    `}
                  />
                `}
              />
              <${ContextMenu.Item}
                children=${html`
                  <${ContextMenu.Menu}
                    icon=${html`
                      <${Icon} prefix="mdi" name="vector-line" size=${14} />
                    `}
                    name="Relationship"
                    right=${chevronRightIcon}
                  />
                `}
                subChildren=${html`
                  ${createDrawRelationshipMenus(app.value, props.onClose).map(
                    menu => html`
                      <${ContextMenu.Item}
                        .onClick=${menu.onClick}
                        children=${html`
                          <${ContextMenu.Menu}
                            icon=${html`
                              <${Icon}
                                prefix="base64"
                                name=${menu.iconName}
                                size=${14}
                              />
                            `}
                            name=${menu.name}
                            right=${html`
                              <${Kbd} shortcut=${menu.shortcut} />
                            `}
                          />
                        `}
                      />
                    `
                  )}
                `}
              />
              <${ContextMenu.Item}
                children=${html`
                  <${ContextMenu.Menu}
                    icon=${html`<${Icon} name="eye" size=${14} />`}
                    name="View Option"
                    right=${chevronRightIcon}
                  />
                `}
                subChildren=${html`
                  ${createShowMenus(app.value).map(
                    menu => html`
                      <${ContextMenu.Item}
                        .onClick=${menu.onClick}
                        children=${html`
                          <${ContextMenu.Menu}
                            icon=${menu.checked
                              ? html`<${Icon} name="check" size=${14} />`
                              : null}
                            name=${menu.name}
                          />
                        `}
                      />
                    `
                  )}
                `}
              />
              <${ContextMenu.Item}
                children=${html`
                  <${ContextMenu.Menu}
                    icon=${html`
                      <${Icon} prefix="mdi" name="database" size=${14} />
                    `}
                    name="Database"
                    right=${chevronRightIcon}
                  />
                `}
                subChildren=${html`
                  ${createDatabaseMenus(app.value).map(
                    menu => html`
                      <${ContextMenu.Item}
                        .onClick=${menu.onClick}
                        children=${html`
                          <${ContextMenu.Menu}
                            icon=${menu.checked
                              ? html`<${Icon} name="check" size=${14} />`
                              : null}
                            name=${menu.name}
                          />
                        `}
                      />
                    `
                  )}
                `}
              />
              <${ContextMenu.Item}
                children=${html`
                  <${ContextMenu.Menu}
                    icon=${html`<${Icon} name="file-import" size=${14} />`}
                    name="Import"
                    right=${chevronRightIcon}
                  />
                `}
                subChildren=${html`
                  ${createImportMenus(app.value, props.onClose).map(
                    menu => html`
                      <${ContextMenu.Item}
                        .onClick=${menu.onClick}
                        children=${html`
                          <${ContextMenu.Menu}
                            icon=${html`<${Icon}
                              prefix=${menu.icon.prefix}
                              name=${menu.icon.name}
                              size=${14}
                            />`}
                            name=${menu.name}
                          />
                        `}
                      />
                    `
                  )}
                `}
              />
              <${ContextMenu.Item}
                children=${html`
                  <${ContextMenu.Menu}
                    icon=${html`<${Icon} name="file-export" size=${14} />`}
                    name="Export"
                    right=${chevronRightIcon}
                  />
                `}
                subChildren=${html`
                  ${createExportMenus(
                    app.value,
                    props.onClose,
                    props.root.value
                  ).map(
                    menu => html`
                      <${ContextMenu.Item}
                        .onClick=${menu.onClick}
                        children=${html`
                          <${ContextMenu.Menu}
                            icon=${html`<${Icon}
                              prefix=${menu.icon.prefix}
                              name=${menu.icon.name}
                              size=${14}
                            />`}
                            name=${menu.name}
                          />
                        `}
                      />
                    `
                  )}
                `}
              />
              <${ContextMenu.Item}
                .onClick=${handleAutomaticTablePlacement}
                children=${html`
                  <${ContextMenu.Menu}
                    icon=${html`<${Icon}
                      prefix="mdi"
                      name="atom"
                      size=${14}
                    />`}
                    name="Automatic Table Placement"
                  />
                `}
              />
            `}
          />
        `;
  };
};

export default ErdContextMenu;
