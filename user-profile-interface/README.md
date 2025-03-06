# User Profile Interface

This project is a dynamic user profile interface that allows users to manage their profiles effectively. It includes a profile summary card and a progressive profile completion module, ensuring that users can easily fill out their information and see their progress.

## Project Structure

The project is organized as follows:

```
user-profile-interface
├── src
│   ├── assets
│   │   ├── css
│   │   │   ├── style.css
│   │   │   └── floating-menu.css
│   │   ├── img
│   │   │   ├── default-avatar.png
│   │   │   ├── logo.png
│   │   │   └── favicon.ico
│   │   └── js
│   │       ├── components
│   │       │   ├── avatar-upload.js
│   │       │   ├── profile-completion.js
│   │       │   └── form-validator.js
│   │       ├── services
│   │       │   ├── auth-service.js
│   │       │   ├── firebase-config.js
│   │       │   ├── profile-service.js
│   │       │   └── storage-service.js
│   │       ├── utils
│   │       │   ├── form-utils.js
│   │       │   └── validation.js
│   │       └── app.js
│   ├── data
│   │   └── location-data.js
│   ├── pages
│   │   ├── login.html
│   │   ├── profile.html
│   │   └── settings.html
│   └── index.html
├── .gitignore
├── package.json
└── README.md
```

## Features

- **Profile Summary Card**: Displays user information such as name, email, and profile picture.
- **Progressive Profile Completion**: Users can fill out their profiles step-by-step, with validation for required fields.
- **Avatar Upload**: Users can upload and preview their profile pictures.
- **Responsive Design**: The interface is designed to be user-friendly on both desktop and mobile devices.

## Setup Instructions

1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd user-profile-interface
   ```

2. **Install Dependencies**: 
   ```
   npm install
   ```

3. **Run the Application**: 
   Open `index.html` in your web browser.

## Usage Guidelines

- Navigate to the **Profile** page to view and edit your profile information.
- Use the **Finalize Profile** button to complete your profile setup.
- Ensure that all required fields are filled out to achieve a 100% profile completion rate.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.