// @ts-ignore
import { FormComponents } from "@cerebroapp/cerebro-ui";

const { Checkbox, Select, Text } = FormComponents;

const components = {
  bool: Checkbox,
  option: Select,
};

type Props = {
  type: keyof typeof components;
  value: any;
  options: any[];
};

function FormItem({ type, value, options, ...props }: Props) {
  const Component = components[type] || Text;

  let actualValue = value;
  if (Component === Select) {
    // when the value is a string, we need to find the option that matches it
    if (typeof value === "string" && options) {
      actualValue = options.find((option) => option.value === value);
    }
  }

  return (
    <Component type={type} value={actualValue} options={options} {...props} />
  );
}

export default FormItem;
