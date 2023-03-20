import { SmartIcon } from '@rokii/ui';
import { useRokiStore } from '@/state/rokiStore';
import styles from './styles.module.css';
import { useInputStore } from '@/state/inputStore';

type Props = {
  isSelected: boolean;
  icon?: string;
  title?: string;
  onSelect: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  subtitle?: string;
  style: React.CSSProperties;
  index: number;
};

function Row ({
  isSelected,
  icon,
  title,
  onSelect,
  subtitle,
  style,
  index
}: Props) {
  const setSelected = useRokiStore(s => s.setSelected);

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isSelected) return;
    const { movementX, movementY } = event;

    const isNotMoving = movementX === 0 && movementY === 0;
    if (isNotMoving) return;

    setSelected(index);
  };

  const className = isSelected ? `${styles.row} ${styles.selected}` : styles.row;

  return (
    <div
      style={style}
      className={className}
      onClick={onSelect}
      onMouseMove={onMouseMove}
      onKeyDown={() => undefined}
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
