// @ts-ignore
import { KeyboardNavItem } from "@cerebroapp/cerebro-ui";

type ActionButtonProps = {
  onSelect: Function;
  text: string;
};

export const ActionButton = ({ onSelect, text }: ActionButtonProps) => {
  return <KeyboardNavItem onSelect={onSelect}>{text}</KeyboardNavItem>;
};
