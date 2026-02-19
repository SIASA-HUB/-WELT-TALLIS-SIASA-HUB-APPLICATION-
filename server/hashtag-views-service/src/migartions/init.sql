CREATE TABLE post_hashtags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id VARCHAR(50) NOT NULL,
  hashtag VARCHAR(100) NOT NULL,
  user_id VARCHAR(50) NULL,
  created_at DATETIME NULL
);


CREATE TABLE IF NOT EXISTS video_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  video_id INT NOT NULL,
  user_agent TEXT,
  viewed_at DATETIME DEFAULT NULL,  -- you'll enter this manually
  FOREIGN KEY (video_id) REFERENCES backup_videos(id) ON DELETE CASCADE
);
