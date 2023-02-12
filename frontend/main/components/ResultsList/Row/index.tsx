// @ts-ignore
import { SmartIcon } from "@cerebroapp/cerebro-ui";
import styles from "./styles.module.scss";

type Props = {
  isSelected: boolean;
  icon?: string;
  title?: string;
  onSelect: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  subtitle?: string;
  style: Object;
};

function Row({
  isSelected,
  icon,
  title,
  onSelect,
  onMouseMove,
  subtitle,
  style,
}: Props) {
  const classNames = [styles.row, isSelected ? styles.selected : null].join(
    " "
  );

  return (
    <div
      style={style}
      className={classNames}
      onClick={onSelect}
      onMouseMove={onMouseMove}
      onKeyDown={() => {}}
    >
      {icon && <SmartIcon path={icon} className={styles.icon} />}

      <div className={styles.details}>
        {title && <div className={styles.title}>{title}</div>}

        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
}

export default Row;
