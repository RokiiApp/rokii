import { KeyboardNavItem } from '@rokii/ui';

type ActionButtonProps = {
  onSelect?: (event: React.SyntheticEvent<Element, Event>) => void;
  text: string;
};

export const ActionButton = ({ onSelect, text }: ActionButtonProps) => {
  return <KeyboardNavItem onSelect={onSelect}>{text}</KeyboardNavItem>;
};
