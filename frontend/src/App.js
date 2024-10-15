import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Slider } from '@mui/material';

function App() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [modelType, setModelType] = useState('base');
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleTemperatureChange = (event, newValue) => {
    setTemperature(newValue);
  };

  const handleSubmit = async () => {
    if (!image) {
      alert('Please select an image first!');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('temperature', temperature);
    formData.append('model_type', modelType);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData);
      setResult(response.data.result);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setImagePreview(null);
    setResult('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>PicGroove</h1>
      {imagePreview && (
        <div style={{ marginTop: '20px', width: '150px', height: '150px', border: '1px solid #ccc', display: 'inline-block' }}>
          <img src={imagePreview} alt="Selected" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <br /><br />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      <br /><br />
      <div style={{ width: '300px', margin: '0 auto' }}>
        <p>Adjust Creativity (Temperature): {temperature.toFixed(2)}</p>
        <Slider
          value={temperature}
          min={0}
          max={1}
          step={0.01}
          onChange={handleTemperatureChange}
          aria-labelledby="temperature-slider"
        />
      </div>
      <br />
      <div>
        <p>Select Captioning Model:</p>
        <label>
          <input
            type="radio"
            value="base"
            checked={modelType === 'base'}
            onChange={(e) => setModelType(e.target.value)}
          />
          Base Model
        </label>
        <label style={{ marginLeft: '20px' }}>
          <input
            type="radio"
            value="large"
            checked={modelType === 'large'}
            onChange={(e) => setModelType(e.target.value)}
          />
          Large Model
        </label>
      </div>
      <br />
      <button onClick={handleSubmit} disabled={!image || isLoading}>
        {isLoading ? 'Processing...' : 'Get Captions and Music'}
      </button>
      <button onClick={handleClear} style={{ marginLeft: '10px' }}>
        Clear
      </button>
      <br /><br />
      {result && (
        <div>
          <h2>Recommendations:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default App;