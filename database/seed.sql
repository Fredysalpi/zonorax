-- Datos de ejemplo para desarrollo
USE zonorax_db;

-- Insertar artistas de ejemplo
INSERT INTO artists (name, bio, image_url) VALUES
('Rock Fred', 'DJ especializado en rock alternativo y electrónica', '/images/artists/rock-fred.jpg'),
('Gabriela Flores', 'Reggaeton y música urbana latina', '/images/artists/gabriela-flores.jpg'),
('María Arteaga', 'Latin Pop y Old School', '/images/artists/maria-arteaga.jpg'),
('GuaraTech MAYESTIK', 'Sonidos urbanos de Bogotá', '/images/artists/guaratech.jpg'),
('Jere Klein', 'Música urbana chilena', '/images/artists/jere-klein.jpg'),
('Katteyes', 'DJ y productora de música electrónica', '/images/artists/katteyes.jpg');

-- Insertar álbumes de ejemplo
INSERT INTO albums (title, artist_id, cover_image, release_date) VALUES
('Rock Fred Sessions', 1, '/images/albums/rock-fred.jpg', '2024-01-15'),
('Reggaetón Old School', 2, '/images/albums/reggaeton-oldschool.jpg', '2023-11-20'),
('Latin Pop Classics', 3, '/images/albums/latin-pop.jpg', '2023-08-10'),
('BOGOTA SONIDITO', 4, '/images/albums/bogota-sonidito.jpg', '2024-02-01'),
('TODO KE VER', 6, '/images/albums/todo-ke-ver.jpg', '2024-03-15');

-- Insertar canciones de ejemplo
INSERT INTO songs (title, artist_id, album_id, duration, file_url, cover_image, genre, bpm, key_signature) VALUES
('Rock Fred Mix Vol.1', 1, 1, 240, 'https://r2.example.com/rock-fred-mix.mp3', '/images/albums/rock-fred.jpg', 'Rock/Electronic', 128, 'Am'),
('Reggaetón Old school pa\' activar 🔥', 2, 2, 210, 'https://r2.example.com/reggaeton-activar.mp3', '/images/albums/reggaeton-oldschool.jpg', 'Reggaeton', 95, 'Dm'),
('Latin Pop Old School 🎁🎶🔥', 3, 3, 195, 'https://r2.example.com/latin-pop-oldschool.mp3', '/images/albums/latin-pop.jpg', 'Latin Pop', 100, 'C'),
('BOGOTA SONIDITO (GuaraTech) MAYESTIK', 4, 4, 180, 'https://r2.example.com/bogota-sonidito.mp3', '/images/albums/bogota-sonidito.jpg', 'Urban', 98, 'Em'),
('DJ Set Electrónico', 1, 1, 300, 'https://r2.example.com/dj-set.mp3', '/images/albums/rock-fred.jpg', 'Electronic', 130, 'Gm'),
('Fred Electro PL', 1, 1, 220, 'https://r2.example.com/fred-electro.mp3', '/images/albums/rock-fred.jpg', 'Electro', 125, 'F'),
('Tus me gusta Mix', 3, 3, 200, 'https://r2.example.com/tus-me-gusta.mp3', '/images/albums/latin-pop.jpg', 'Mix', 110, 'G'),
('No Doubt Classics', 3, 3, 190, 'https://r2.example.com/no-doubt.mp3', '/images/albums/latin-pop.jpg', 'Pop', 105, 'D'),
('TODO KE VER', 6, 5, 158, 'https://r2.example.com/todo-ke-ver.mp3', '/images/albums/todo-ke-ver.jpg', 'Electronic', 128, 'Am');

-- Insertar usuario de prueba (password: demo123)
INSERT INTO users (username, email, password_hash, profile_image) VALUES
('demo_user', 'demo@zonorax.com', '$2b$10$rKvVPx8qLqKqKqKqKqKqKuO8qLqKqKqKqKqKqKqKqKqKqKqKqKqKq', '/images/users/demo.jpg');

-- Insertar playlists de ejemplo
INSERT INTO playlists (user_id, name, description, cover_image, is_public) VALUES
(1, 'Tus me gusta', 'Playlist • 386 canciones', '/images/playlists/tus-me-gusta.jpg', true),
(1, 'Rock Fred', 'Playlist • Freedz', '/images/playlists/rock-fred.jpg', true),
(1, 'Latin Pop Old School 🎁🎶🔥', 'Playlist • María Arteaga', '/images/playlists/latin-pop.jpg', true),
(1, 'Reggaetón Old school pa\' activar 🔥', 'Playlist • Gabriela Flores', '/images/playlists/reggaeton.jpg', true),
(1, 'Fred Electro PL', 'Playlist de música electrónica', '/images/playlists/fred-electro.jpg', true),
(1, 'TODO KE VER', 'Vídeo musical • Jere Klein, Katteyes, Mateo on the beatz', '/images/playlists/todo-ke-ver.jpg', true);

-- Insertar canciones en playlists
INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES
(1, 7, 1),
(1, 3, 2),
(1, 8, 3),
(2, 1, 1),
(2, 5, 2),
(2, 6, 3),
(3, 3, 1),
(3, 8, 2),
(4, 2, 1),
(5, 6, 1),
(5, 5, 2),
(6, 9, 1);
