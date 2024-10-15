from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import (
    BlipProcessor,
    BlipForConditionalGeneration,
    Blip2Processor,
    Blip2ForConditionalGeneration
)
from PIL import Image
import openai
import torch
import os


app = Flask(__name__)
CORS(app)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# BLIP Base Model
blip_base_processor = BlipProcessor.from_pretrained(
    'Salesforce/blip-image-captioning-base')
blip_base_model = BlipForConditionalGeneration.from_pretrained(
    'Salesforce/blip-image-captioning-base')
blip_base_model.to(device)

# BLIP Large Model
blip_large_processor = BlipProcessor.from_pretrained(
    'Salesforce/blip-image-captioning-large')
blip_large_model = BlipForConditionalGeneration.from_pretrained(
    'Salesforce/blip-image-captioning-large')
blip_large_model.to(device)


openai.api_key = os.getenv('OPENAI_API_KEY')


def generate_image_caption(image_path, model_type='base'):
    image = Image.open(image_path).convert('RGB')

    if model_type == 'base':
        # Use BLIP Base Model
        inputs = blip_base_processor(
            images=image, return_tensors='pt').to(device)
        outputs = blip_base_model.generate(**inputs)
        caption = blip_base_processor.decode(
            outputs[0], skip_special_tokens=True)
    elif model_type == 'large':
        # Use BLIP Large Model
        inputs = blip_large_processor(
            images=image, return_tensors='pt').to(device)
        outputs = blip_large_model.generate(**inputs)
        caption = blip_large_processor.decode(
            outputs[0], skip_special_tokens=True)
    else:
        return "Invalid model type specified."

    return caption.strip()


def generate_caption_and_music(image_caption, temperature=0.7):
    prompt = f"Based on the image description: '{
        image_caption}', generate three creative Instagram captions and suggest three songs that match the mood."

    try:
        response = openai.ChatCompletion.create(
            model='gpt-4o',
            messages=[
                {'role': 'system', 'content': 'You are a creative assistant that provides catchy Instagram captions and music recommendations.'},
                {'role': 'user', 'content': prompt}
            ],
            temperature=temperature,  # Higher temperature results in more creative responses
            max_tokens=500,
        )

        result = response.choices[0].message.content.strip()
        return result

    except openai.error.OpenAIError as e:
        print(f"OpenAI API error: {e}")
        return "An error occurred while generating captions and music recommendations."
    except Exception as e:
        print(f"Unexpected error: {e}")
        return "An error occurred while processing your request."


@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    file = request.files['image']
    temperature = float(request.form.get('temperature', 0.7))
    model_type = request.form.get('model_type', 'base')
    image_path = os.path.join('uploads', file.filename)
    file.save(image_path)

    image_caption = generate_image_caption(image_path, model_type)

    print(f"Generated caption using {model_type} model: {image_caption}")

    result = generate_caption_and_music(image_caption, temperature)

    return jsonify({'result': result})


if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True)
