import { useState } from "react";
import "./Slider.css"; // Slider stillerini bu dosyadan alıyoruz.

const Slider = () => {
  const [value, setValue] = useState(50); // Slider başlangıç değeri

  const handleChange = (e: any) => {
    setValue(e.target.value);
  };

  return (
    <div className="slider-container">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        className="slider"
        onChange={handleChange}
      />
      <span className="slider-value">{value}</span>
    </div>
  );
};

export default Slider;
