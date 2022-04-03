import { FiMinus, FiPlus } from "react-icons/fi";

type Props = {
  min: number;
  max: number;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
};

const NumberInput = ({min, max, value, disabled, onChange}: Props) => {
  const onDecrement = () => {
    !disabled && onChange(Math.max(min, value - 1));
  };

  const onIncrement = () => {
    !disabled && onChange(Math.min(max, value + 1));
  };

  return (
    <div className="flex">
      <div className="py-4 border">
        <FiMinus
          className="text-4xl text-white cursor-pointer"
          onClick={onDecrement}
        />
      </div>
      <input
        value={!disabled ? value : 0}
        disabled={disabled}
        className="text-center text-2xl px-2"
        readOnly
      />
      <div className="py-4 border">
        <FiPlus
          className="text-4xl text-white cursor-pointer"
          onClick={onIncrement}
        />
      </div>
    </div>
  );
};

export default NumberInput;
