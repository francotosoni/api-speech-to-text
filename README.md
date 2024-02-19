## 

`url https://stt-galicia.1chlub009ij6.us-south.codeengine.appdomain.cloud`

### Request

`POST /stt`

    curl -X POST -H "Content-Type: audio/mpeg" --data-binary "@{file_path}" "https://stt-galicia.1chlub009ij6.us-south.codeengine.appdomain.cloud/stt"

Replace file_path in brackets, for example: "@/content/audio.mp3".

The @ before the filename ("@/content/audio.mp3") instructs curl to read the content of the file and include it in the request as binary data.

### Response

    {"transcription":"Transcribed audio to text"}

### Example request in Python

    import requests
    # Function to read a binary file and send it in the body of a POST request
    def upload_file(file_path, target_url):
        with open(file_path, 'rb') as file:
            binary_buffer = file.read()
            headers = {'Content-Type': 'audio/mpeg'}
            response = requests.post(target_url, data=binary_buffer, headers=headers)

        return response

    # Example usage
    if __name__ == "__main__":
        file_path = '/content/audio.mp3'  # Replace with the path to your binary file
        target_url = 'https://stt-galicia.1chlub009ij6.us-south.codeengine.appdomain.cloud/stt'  # Replace with your target URL

        response = upload_file(file_path, target_url)

        if response.status_code == 200:
            print(response.text)
            print("File uploaded successfully!")
        else:
            print(response.text)
            print(f"Failed to upload file. Status code: {response.status_code}")