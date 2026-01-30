


CREATE TABLE leaders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leader_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    party VARCHAR(100),
    location VARCHAR(100),
    tags JSON, -- Stores interests/tags as an array
    status VARCHAR(20) DEFAULT 'active',
    -- Manual timestamp fields (No DEFAULT or ON UPDATE)
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



ALTER   TABLE  leaders
    -> ADD  COLUMN   image_url  VARCHAR(255)  AFTER   status;