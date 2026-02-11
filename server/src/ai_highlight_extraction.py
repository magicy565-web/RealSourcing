#!/usr/bin/env python3
import os
from openai import OpenAI
import json

# Initialize the OpenAI client
# The API key and base URL are pre-configured in the environment
client = OpenAI()

def analyze_transcript_with_max(transcript_text):
    """
    Analyzes the provided transcript text using a powerful AI model to extract key B2B sourcing moments.

    Args:
        transcript_text: The full text of the webinar transcript.

    Returns:
        A list of dictionaries, where each dictionary represents a key highlight
        with a timestamp, a descriptive title, and a brief summary.
    """
    print("Starting transcript analysis with Max model...")

    # This prompt is engineered to guide the Max model in identifying and structuring
    # key moments from a B2B sourcing webinar transcript. It asks the model to act as
    # an expert sourcing agent and to output a structured JSON object.
    system_prompt = (
        "You are an expert B2B sourcing analyst. Your task is to analyze the provided webinar transcript "
        "and identify key, actionable moments relevant to a procurement professional. Focus on product presentations, "
        "technical specifications, pricing mentions, supplier introductions, and calls to action. "
        "Structure your output as a JSON array of objects, where each object contains 'timestamp_start', "
        "'timestamp_end', 'title', and 'summary'. The title should be a concise, impactful headline for the event, "
        "and the summary should be a 1-2 sentence description. Ensure timestamps are in 'MM:SS.s' format."
    )

    try:
        completion = client.chat.completions.create(
            model="gemini-2.5-flash",  # Using the specified powerful model
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcript_text}
            ],
            response_format={"type": "json_object"}
        )
        print("Successfully received response from the model.")
        # The response from the model is expected to be a JSON string.
        response_content = completion.choices[0].message.content
        print("--- Raw Model Response ---")
        print(response_content)
        print("--------------------------")

        # The model is instructed to return a JSON object, but sometimes it might be wrapped
        # in markdown code blocks (```json ... ```). We need to clean that up.
        if response_content.strip().startswith('```json'):
            # Extract the content between the fences
            json_str = response_content.strip().split('\n', 1)[1].rsplit('\n```', 1)[0]
        else:
            json_str = response_content

        # Now, parse the cleaned JSON string
        highlights_data = json.loads(json_str)

        # The actual list of highlights might be nested within the JSON object.
        # We'll look for a key that likely contains the array, such as 'highlights'.
        if isinstance(highlights_data, dict) and len(highlights_data.keys()) == 1:
            key = list(highlights_data.keys())[0]
            return highlights_data[key]
        else:
            # If the root is the array itself
            return highlights_data

    except Exception as e:
        print(f"An error occurred during AI analysis: {e}")
        return []

def main():
    """
    Main function to read the transcript, run the analysis, and save the results.
    """
    transcript_path = "/home/ubuntu/cleaned_transcript.txt"
    output_path = "/home/ubuntu/RealSourcing/client/src/data/timeline_highlights.json"

    print(f"Reading transcript from {transcript_path}")
    try:
        with open(transcript_path, 'r') as f:
            transcript = f.read()
    except FileNotFoundError:
        print(f"Error: Transcript file not found at {transcript_path}")
        return

    if not transcript:
        print("Error: Transcript file is empty.")
        return

    # Run the analysis
    highlights = analyze_transcript_with_max(transcript)

    # Save the results to a JSON file for the frontend to use
    if highlights:
        print(f"Successfully extracted {len(highlights)} highlights.")
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w') as f:
                json.dump(highlights, f, indent=2)
            print(f"Highlights saved to {output_path}")
        except IOError as e:
            print(f"Error saving highlights to file: {e}")
    else:
        print("No highlights were extracted from the transcript.")

if __name__ == "__main__":
    main()
