import { css, FC, html, render } from '@dineug/r-html';
import type { Meta, StoryObj } from '@storybook/html';

import { useContextMenuRootProvider } from './context-menu-root/contextMenuRootContext';
import ContextMenu from './ContextMenu';

type ContextMenuTemplateProps = {
  onClick?: (event: MouseEvent) => void;
};

const ContextMenuTemplate: FC<ContextMenuTemplateProps> = (props, ctx) => {
  const contextMenu = useContextMenuRootProvider(ctx);

  const handleClick = (event: MouseEvent) => {
    props.onClick?.(event);
    contextMenu.state.show = false;
  };

  return () => html`
    <div
      class=${css`
        display: flex;
        width: 400px;
        height: 400px;
        align-items: center;
        justify-content: center;
        border: 1px solid blue;
      `}
      @contextmenu=${contextMenu.onContextmenu}
      @click=${contextMenu.onClick}
    >
      Right-click here
      ${contextMenu.state.show
        ? html`
            <${ContextMenu.Content}
              children=${html`
                <${ContextMenu.Item}
                  .onClick=${handleClick}
                  children=${'Item 1'}
                />
                <${ContextMenu.Item}
                  .onClick=${handleClick}
                  children=${'Item 2'}
                />
                <${ContextMenu.Item}
                  .onClick=${handleClick}
                  children=${'Item 3'}
                />
                <${ContextMenu.Sub}
                  children=${html`
                    <${ContextMenu.SubTrigger} children=${'Submenu'} />
                    <${ContextMenu.SubContent}
                      children=${html`
                        <${ContextMenu.Item}
                          .onClick=${handleClick}
                          children=${'Item 1'}
                        />
                        <${ContextMenu.Item}
                          .onClick=${handleClick}
                          children=${'Item 2'}
                        />
                        <${ContextMenu.Sub}
                          children=${html`
                            <${ContextMenu.SubTrigger} children=${'Submenu'} />
                            <${ContextMenu.SubContent}
                              children=${html`
                                <${ContextMenu.Item}
                                  .onClick=${handleClick}
                                  children=${'Item 1'}
                                />
                                <${ContextMenu.Item}
                                  .onClick=${handleClick}
                                  children=${'Item 2'}
                                />
                                <${ContextMenu.Item}
                                  .onClick=${handleClick}
                                  children=${'Item 3'}
                                />
                              `}
                            />
                          `}
                        />
                        <${ContextMenu.Item}
                          .onClick=${handleClick}
                          children=${'Item 3'}
                        />
                      `}
                    />
                  `}
                />
                <${ContextMenu.Item}
                  .onClick=${handleClick}
                  children=${'Item 4'}
                />
              `}
            />
          `
        : null}
    </div>
  `;
};

const meta = {
  title: 'Primitives/ContextMenu',
  tags: ['autodocs'],
  render: args => {
    const fragment = document.createDocumentFragment();
    render(
      fragment,
      html`
        <div>
          <${ContextMenuTemplate} ...${args} />
        </div>
      `
    );
    return fragment;
  },
  argTypes: {
    onClick: { action: 'onClick' },
  },
} satisfies Meta<ContextMenuTemplateProps>;

export default meta;
type Story = StoryObj<ContextMenuTemplateProps>;

export const Normal: Story = {};
