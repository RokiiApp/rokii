// @ts-ignore
import { KeyboardNavItem } from "@cerebroapp/cerebro-ui";

type Props = {
  action: () => Promise<any>[];
  text: string;
  onComplete: () => void;
};

function ActionButton({ action, onComplete, text }: Props) {
  const onSelect = () => {
    Promise.all(action()).then(onComplete);
  };
  return <KeyboardNavItem onSelect={onSelect}>{text}</KeyboardNavItem>;
}

export default ActionButton;
