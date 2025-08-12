### 💊 MedCure: Your Modern Pharmacy Management System

A sleek, intuitive, and highly efficient solution designed to streamline pharmacy operations. MedCure offers a powerful set of tools for managing inventory, accelerating sales, and maintaining secure user data.

-----

### ✨ Key Features

  * **Real-time Dashboard:** Gain instant insights into your business with a dynamic dashboard featuring cards for inventory status, available medicines, total profit, and out-of-stock items.
  * **Intuitive Point of Sales (POS):** A fast and easy-to-use interface for processing sales transactions. It includes features like product search, quantity management, and an integrated discount for PWD/Seniors. You can also view a full sales history and generate official receipts on the fly.
  * **Robust Inventory Management:** Take full control of your stock with a dedicated management page. You can add, edit, and view product details through modals. The system also supports bulk importing of products via CSV and exporting comprehensive inventory reports as PDFs.
  * **Secure Authentication:** User logins and management are handled securely via Supabase, a powerful open-source Firebase alternative.
  * **Customizable Settings:** Personalize the app's appearance and functionality. Update your profile, manage branding (name and logo), and configure security and notification settings.
  * **Archived Products:** Easily restore products that have been archived from the main inventory.
  * **Responsive & Modern UI:** A clean, responsive design built with Tailwind CSS and the Lucide React icon library ensures a great user experience on any device.

-----

### 🚀 Tech Stack

  * **Frontend:** React, Vite, Tailwind CSS, React Router
  * **Backend & Database:** Supabase
  * **Icons:** Lucide React
  * **PDF Generation:** `jspdf` and `jspdf-autotable` for generating reports and receipts.

-----

### 🛠️ Getting Started

Follow these steps to get MedCure up and running on your local machine.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/bulsu-santiagocs/medcure-official.git
    cd medcure-official
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up your environment variables:**

      * Create a `.env` file in the root of the project.
      * Add your Supabase URL and Anon Key.

    <!-- end list -->

    ```
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

-----

### 📜 Available Scripts

In the project directory, you can run:

  * `npm run dev`
    Runs the app in development mode.
  * `npm run build`
    Builds the app for production to the `dist` folder.
  * `npm run preview`
    Serves the production build locally for a preview.
  * `npm run lint`
    Lints the project files for code style issues.
