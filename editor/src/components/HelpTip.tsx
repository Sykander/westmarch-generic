import * as Tooltip from '@radix-ui/react-tooltip';
import { HelpCircle } from 'lucide-react';

type HelpTipProps = {
  label: string;
  children: string;
};

export function HelpTip({ label, children }: HelpTipProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger className="help-trigger" aria-label={label} type="button">
        <HelpCircle size={15} aria-hidden="true" />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="tooltip" sideOffset={8}>
          {children}
          <Tooltip.Arrow className="tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
