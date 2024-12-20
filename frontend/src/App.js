import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import {
  Slider,
  ThemeProvider,
  createTheme,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [modelType, setModelType] = useState('base');
  const fileInputRef = useRef();

  const handleImageChange = (file) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: 'image/*',
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleImageChange(acceptedFiles[0]);
      }
    },
  });

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

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="app-container">
        <Typography variant="h3" component="h1" gutterBottom>
          PicGroove
        </Typography>

        {/* Image Preview */}
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Selected" />
          </div>
        )}

        {/* Drag-and-Drop Area */}
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active-dropzone' : ''}`}
        >
          <input {...getInputProps()} />
          <Typography>
            {isDragActive
              ? 'Drop the image here...'
              : 'Drag & Drop an image here, or click to select'}
          </Typography>
        </div>

        {/* File Picker Button */}
        <div className="file-input-container">
          <Button
            variant="contained"
            color="primary"
            component="label"
          >
            Choose File
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImageChange(e.target.files[0])}
            />
          </Button>
          {image && (
            <Typography variant="body2" style={{ marginTop: '10px' }}>
              Selected File: {image.name}
            </Typography>
          )}
        </div>

        {/* Slider */}
        <div className="slider-container">
          <Typography gutterBottom>
            Adjust Creativity (Temperature): {temperature.toFixed(2)}
          </Typography>
          <Slider
            value={temperature}
            min={0}
            max={1}
            step={0.01}
            onChange={handleTemperatureChange}
            aria-labelledby="temperature-slider"
          />
        </div>

        {/* Model Selection */}
        <FormControl component="fieldset" className="model-selection">
          <FormLabel component="legend">Select Captioning Model:</FormLabel>
          <RadioGroup
            row
            aria-label="modelType"
            name="modelType"
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
          >
            <FormControlLabel value="base" control={<Radio />} label="Base Model" />
            <FormControlLabel value="large" control={<Radio />} label="Large Model" />
          </RadioGroup>
        </FormControl>

        {/* Submit and Clear Buttons */}
        <div className="button-group">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!image || isLoading}
          >
            {isLoading ? 'Processing...' : 'Get Captions and Music'}
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClear} className="clear-button">
            Clear
          </Button>
        </div>

        {/* Result Section */}
        {result && (
          <div className="result-container">
            <Typography variant="h5" gutterBottom>
              Recommendations:
            </Typography>

            <div className="caption-container">
              <Typography variant="h6" gutterBottom>
                Captions:
              </Typography>
              {result.captions && result.captions.map((caption, index) => (
                <Typography key={index} variant="body1" className="caption-text">
                  {caption}
                </Typography>
              ))}
            </div>

            <div className="song-container">
              <Typography variant="h6" gutterBottom>
                Songs:
              </Typography>
              {result.songs && result.songs.map((song, index) => (
                <Typography key={index} variant="body1" className="song-text">
                  {song}
                </Typography>
              ))}
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
