from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import openai
import torch
import os

app = Flask(__name__)
CORS(app)

# Load Image Captioning Model
processor = BlipProcessor.from_pretrained(
    'Salesforce/blip-image-captioning-base')
model = BlipForConditionalGeneration.from_pretrained(
    'Salesforce/blip-image-captioning-base')


openai.api_key = os.getenv('OPENAI_API_KEY')


def generate_image_caption(image_path):
    image = Image.open(image_path).convert('RGB')
    inputs = processor(image, return_tensors='pt')
    outputs = model.generate(**inputs)
    caption = processor.decode(outputs[0], skip_special_tokens=True)
    return caption


def generate_caption_and_music(image_caption):
    prompt = f"Based on the image description: '{
        image_caption}', generate three creative Instagram captions and suggest three songs that match the mood."

    try:
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[
                {'role': 'system', 'content': 'You are a creative assistant that provides catchy Instagram captions and music recommendations.'},
                {'role': 'user', 'content': prompt}
            ],
            temperature=0.7,
            max_tokens=500,
        )

        result = response['choices'][0]['message']['content'].strip()
        return result

    except Exception as e:
        print(f"Error occurred: {e}")
        return "An error occurred while generating captions and music recommendations."


@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    file = request.files['image']
    image_path = os.path.join('uploads', file.filename)
    file.save(image_path)

    # Generate image caption
    image_caption = generate_image_caption(image_path)

    # Get captions and music recommendations
    result = generate_caption_and_music(image_caption)

    return jsonify({'result': result})


if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True)
