-- Таблица задач
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    task_text TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица администраторов
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_tasks_username ON tasks(username);
CREATE INDEX IF NOT EXISTS idx_tasks_email ON tasks(email);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Вставка тестовых данных
INSERT INTO tasks (username, email, task_text, is_completed, is_edited) VALUES
('Pavel Finagin', 'pavel@gmail.com', 'Create todo application', false, false),
('Robert Smith', 'robert@gmail.com', 'Cure your wounds', true, false),
('Jim Morrison', 'jim@gmail.com', 'Close the doors', false, true),
('Thom Yorke', 'thom@gmail.com', 'Radio in your head', true, true),
('Trent Reznor', 'trent@gmail.com', 'Buy nails of nine inch each', false, false)
ON CONFLICT DO NOTHING;
