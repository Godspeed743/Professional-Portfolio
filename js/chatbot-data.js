window.chatbotKnowledgeBase = {
    welcome: "Hi! I'm Mohammad's portfolio assistant. Ask about projects, skills, experience, or how to get in touch.",
    categories: {
        greetings: {
            keywords: ['hello', 'hi', 'hey', 'greetings', 'howdy', 'what up', 'yo', 'sup'],
            responses: ["Hi! Ask me about Mohammad's projects, education, training, or skills."]
        },
        about: {
            keywords: ['about', 'mohammad', 'who are you', 'background', 'bio', 'introduce'],
            responses: ["Mohammad Hammad is a Data Science and Full-Stack developer based in Delhi, India. His **BCA at GGSIPU is listed for 2023–2026**, with a CGPA of 8.8/10."]
        },
        education: {
            keywords: ['education', 'degree', 'university', 'college', 'bca', 'ggsipu', 'cgpa', 'study'],
            responses: ["Mohammad's Bachelor of Computer Applications (BCA) is at Guru Gobind Singh Indraprastha University (GGSIPU), listed for 2023–2026. His CGPA is 8.8/10."]
        },
        experience: {
            keywords: ['experience', 'training', 'ikigai', 'iitm'],
            responses: ["Mohammad completed Data Science and Machine Learning training at IKIGAI Lab from June 16 to July 26, 2025, in collaboration with IITM."]
        },
        projects: {
            keywords: ['projects', 'portfolio', 'showcase', 'built', 'developed'],
            responses: ["**Featured projects** include a MySQL data-cleaning workflow, the Blinking Stars healthcare platform, a perfume e-commerce website, and a Stock Market Price Prediction / CAPM web app. You can explore them in the Projects section."]
        },
        project_data: {
            keywords: ['data cleaning', 'mysql', 'sql'],
            responses: ["The Data Cleaning with MySQL project uses MySQL Workbench to prepare raw CSV data by removing duplicates, handling nulls, standardizing values, and removing unnecessary columns."]
        },
        project_healthcare: {
            keywords: ['blinking stars', 'healthcare'],
            responses: ["Blinking Stars is a responsive therapy-center website built with HTML, CSS, JavaScript, PHP, and MySQL. It includes automated inquiries and WhatsApp communication. Live site: https://blinkingstars.in/"]
        },
        project_perfume: {
            keywords: ['perfume', 'e commerce', 'ecommerce', 'mqperfume'],
            responses: ["The Mohammad Al Qamar Perfumes project is an e-commerce website built with HTML, CSS, JavaScript, and PHP, with WhatsApp ordering and Google Sheets integration. Live site: https://mqperfume.com/"]
        },
        project_stock: {
            keywords: ['stock market', 'capm', 'streamlit', 'yfinance'],
            responses: ["The Stock Market Price Prediction / CAPM web app uses Python, Streamlit, Pandas, NumPy, and Yahoo Finance data for stock analysis, technical indicators, ARIMA forecasts, and CAPM calculations."]
        },
        skills: {
            keywords: ['skills', 'skill', 'tech stack', 'technologies', 'tools', 'languages', 'proficient'],
            responses: ["The portfolio lists Python, C/C++, Java, PHP, Pandas, NumPy, Scikit-learn, data visualization, HTML, CSS, JavaScript, Tailwind, MySQL, Git/GitHub, Power BI, Jupyter, and VS Code."]
        },
        certifications: {
            keywords: ['certification', 'certifications', 'certificate', 'certificates', 'credential'],
            responses: ["The portfolio lists an IBM Python Certification, Microsoft Office Specialist – Excel 2019 Associate, and an IACI Certification in Software Development. See the Certifications section to view them."]
        },
        hiring: {
            keywords: ['hire', 'hiring', 'job', 'jobs', 'opportunity', 'opportunities', 'recruit', 'career', 'position'],
            responses: ["For hiring or collaboration inquiries, contact Mohammad at mohdhammad743@gmail.com or use the contact form on this page."]
        },
        contact: {
            keywords: ['contact', 'email', 'phone', 'reach', 'connect', 'linkedin', 'github'],
            responses: ["Email: mohdhammad743@gmail.com\nPhone: +91 7703823294\nLinkedIn: linkedin.com/in/mohammad-hammad-27a1652a5\nGitHub: github.com/Godspeed743"]
        },
        default: {
            keywords: [],
            responses: ["I can help with details about Mohammad's projects, skills, education, training, certificates, and contact information. Try one of the suggestion buttons."]
        }
    }
};
