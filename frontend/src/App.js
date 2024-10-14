import React, { useState, useRef } from 'react';
import axios from 'axios';

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!image) {
      alert('Please select an image first!');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', image);

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
    setResult('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Instagram Caption & Music Recommender</h1>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      <br /><br />
      <button onClick={handleSubmit} disabled={!image || isLoading}>
        {isLoading ? 'Processing...' : 'Get Captions and Music'}
      </button>
      <button onClick={handleClear} style={{ marginLeft: '10px' }}>Clear</button>
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
