import { DDLParser } from '@vuerd/sql-ddl-parser';
import domToImage from 'dom-to-image';

import { getLatestSnapshot } from '@/core/contextmenu/export.menu';
import { calculateDiff } from '@/core/diff/helper';
import { Logger } from '@/core/logger';
import { Statement } from '@/core/parser';
import { Dialect } from '@/core/parser/helper';
import { LiquibaseParser } from '@/core/parser/LiquibaseParser';
import { createJson } from '@/core/parser/ParserToJson';
import { loadJson$ } from '@/engine/command/editor.cmd.helper';
import { sortTable } from '@/engine/command/table.cmd.helper';
import { ERDEditorContext } from '@@types/core/ERDEditorContext';
import { ExportedStore, Store } from '@@types/engine/store';

let executeExportFileExtra: ((blob: Blob, fileName: string) => void) | null =
  null;

export const createJsonFormat = ({
  canvasState,
  tableState,
  memoState,
  relationshipState,
}: Store): ExportedStore => ({
  canvas: canvasState,
  table: tableState,
  memo: memoState,
  relationship: relationshipState,
});

export function createStoreCopy(store: Store): ExportedStore {
  return JSON.parse(createJsonStringify(store));
}

export const createJsonStringify = (store: Store, space?: number) =>
  JSON.stringify(
    createJsonFormat(store),
    (key, value) => (key.startsWith('_') ? undefined : value),
    space
  );

export function exportPNG(root: Element, name?: string) {
  domToImage.toBlob(root).then(blob => {
    executeExport(
      blob,
      name?.trim() === ''
        ? `unnamed-${new Date().getTime()}.png`
        : `${name}-${new Date().getTime()}.png`
    );
  });
}

export const exportJSON = (json: string, name?: string) =>
  executeExport(
    new Blob([json], { type: 'application/json' }),
    name?.trim() === ''
      ? `unnamed-${new Date().getTime()}.vuerd.json`
      : `${name}-${new Date().getTime()}.vuerd.json`
  );

export const exportSQLDDL = (sql: string, name?: string) =>
  executeExport(
    new Blob([sql]),
    name?.trim() === ''
      ? `unnamed-${new Date().getTime()}.sql`
      : `${name}-${new Date().getTime()}.sql`
  );

export const exportXML = (xml: string, name?: string) => {
  if (xml)
    executeExport(
      new Blob([xml]),
      name?.trim() === ''
        ? `unnamed-${new Date().getTime()}.xml`
        : `${name}-${new Date().getTime()}.xml`
    );
};

const executeExport = (blob: Blob, fileName: string) =>
  executeExportFileExtra
    ? executeExportFileExtra(blob, fileName)
    : executeExportBuiltin(blob, fileName);

function executeExportBuiltin(blob: Blob, fileName: string) {
  const exportHelper = document.createElement('a');
  exportHelper.href = window.URL.createObjectURL(blob);
  exportHelper.download = fileName;
  exportHelper.click();
}

export function setExportFileCallback(
  callback: (blob: Blob, fileName: string) => void
) {
  executeExportFileExtra = callback;
}

export function importJSON({ store }: ERDEditorContext) {
  const importHelperJSON = document.createElement('input');
  importHelperJSON.setAttribute('type', 'file');
  importHelperJSON.setAttribute('accept', '.json');
  importHelperJSON.addEventListener('change', event => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      if (/\.(json)$/i.test(file.name)) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          const value = reader.result;
          if (typeof value === 'string') {
            store.dispatch(loadJson$(value));
          }
        };
      } else {
        alert('Just upload the json file');
      }
    }
  });
  importHelperJSON.click();
}

export function importSQLDDL(context: ERDEditorContext) {
  const importHelper = document.createElement('input');
  importHelper.setAttribute('type', 'file');
  importHelper.setAttribute('accept', `.sql`);
  importHelper.addEventListener('change', event => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      Array.from(input.files)
        .sort((a: File, b: File) => a.name.localeCompare(b.name))
        .forEach(file => {
          const regex = new RegExp(`\.(sql)$`, 'i');
          if (regex.test(file.name)) {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
              const value = reader.result;
              if (typeof value === 'string') {
                const { helper, store } = context;

                const statements = DDLParser(value);

                const json = createJson(
                  //@ts-ignore
                  statements,
                  helper,
                  store.canvasState.database
                );
                store.dispatchSync(loadJson$(json), sortTable());

                var { snapshots } = context;
                snapshots.push(createStoreCopy(store));
                Logger.log('SNAPSHOTS', snapshots);
              }
            };
          } else {
            alert(`Just upload the sql file`);
          }
        });
    }
  });
  importHelper.click();
}

export function importLiquibase(context: ERDEditorContext, dialect: Dialect) {
  const snapshot = getLatestSnapshot(context.snapshots);

  if (
    !snapshot ||
    calculateDiff(context).length === 0 ||
    window.confirm(
      'Found changes, are you sure you want to loose them? If you want to save changes (diff), please, make sure to EXPORT them first.\nPress OK to continue importing file, press CANCEL to abort importing.'
    )
  ) {
    const importHelper = document.createElement('input');
    importHelper.setAttribute('type', 'file');
    importHelper.setAttribute('multiple', 'true');
    importHelper.setAttribute('accept', `.xml`);
    importHelper.addEventListener('change', event => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length) {
        Array.from(input.files)
          .sort((a: File, b: File) => a.name.localeCompare(b.name))
          .forEach(file => {
            const regex = new RegExp(`\.(xml)$`, 'i');
            if (regex.test(file.name)) {
              const reader = new FileReader();
              reader.readAsText(file);
              reader.onload = () => {
                const value = reader.result;
                if (typeof value === 'string') {
                  //-----------------------------------------------------------
                  const { store, helper } = context;

                  const statements = LiquibaseParser(value, dialect);

                  var { snapshots } = context;
                  snapshots.push(createStoreCopy(store));

                  const json = createJson(
                    statements,
                    helper,
                    store.canvasState.database,
                    getLatestSnapshot(snapshots)
                  );
                  store.dispatchSync(loadJson$(json));

                  var { snapshots } = context;
                  snapshots.push(createStoreCopy(store));
                  Logger.log('SNAPSHOTS', snapshots);

                  //---------------------------------------------------------------
                }
              };
            } else {
              alert(`Just upload the xml file`);
            }
          });
      }
    });
    importHelper.click();
  }
}

export function loadLiquibaseChangelog(
  context: ERDEditorContext,
  files: { value: string; path?: string }[],
  dialect: Dialect
) {
  const { store, helper } = context;

  const statements = LiquibaseParser(files[0].value, dialect);

  var { snapshots } = context;
  snapshots.push(createStoreCopy(store));

  const json = createJson(
    statements,
    helper,
    store.canvasState.database,
    getLatestSnapshot(snapshots)
  );
  store.dispatchSync(loadJson$(json));

  var { snapshots } = context;
  snapshots.push(createStoreCopy(store));
  Logger.log('SNAPSHOTS', snapshots);
}
