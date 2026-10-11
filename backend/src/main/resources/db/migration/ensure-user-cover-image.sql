IF OBJECT_ID(N'dbo.USERS', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.USERS', N'cover_image') IS NULL
    ALTER TABLE dbo.USERS ADD cover_image VARCHAR(500) NULL;

IF OBJECT_ID(N'dbo.USERS', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.USERS', N'education') IS NULL
    ALTER TABLE dbo.USERS ADD education NVARCHAR(120) NULL;

IF OBJECT_ID(N'dbo.USERS', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.USERS', N'location') IS NULL
    ALTER TABLE dbo.USERS ADD location NVARCHAR(120) NULL;

IF OBJECT_ID(N'dbo.USERS', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.USERS', N'relationship_status') IS NULL
    ALTER TABLE dbo.USERS ADD relationship_status NVARCHAR(40) NULL;

IF OBJECT_ID(N'dbo.USERS', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.USERS', N'birth_date') IS NULL
    ALTER TABLE dbo.USERS ADD birth_date DATE NULL;

IF OBJECT_ID(N'dbo.SOCIAL_POST', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.SOCIAL_POST', N'shared_post_id') IS NULL
    ALTER TABLE dbo.SOCIAL_POST ADD shared_post_id BIGINT NULL;

IF OBJECT_ID(N'dbo.SOCIAL_POST', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.SOCIAL_POST', N'shared_post_id') IS NOT NULL
   AND NOT EXISTS (
       SELECT 1 FROM sys.foreign_keys
       WHERE name = N'FK_social_post_shared_post'
         AND parent_object_id = OBJECT_ID(N'dbo.SOCIAL_POST')
   )
    ALTER TABLE dbo.SOCIAL_POST
      ADD CONSTRAINT FK_social_post_shared_post
      FOREIGN KEY (shared_post_id) REFERENCES dbo.SOCIAL_POST(post_id);

-- Event names and locations contain user-entered Vietnamese text.
IF OBJECT_ID(N'dbo.SOCIAL_EVENT', N'U') IS NOT NULL
   AND EXISTS (
       SELECT 1 FROM sys.columns
       WHERE object_id = OBJECT_ID(N'dbo.SOCIAL_EVENT')
         AND name = N'title'
         AND system_type_id <> 231
   )
    ALTER TABLE dbo.SOCIAL_EVENT ALTER COLUMN title NVARCHAR(120) NOT NULL;

IF OBJECT_ID(N'dbo.SOCIAL_EVENT', N'U') IS NOT NULL
   AND EXISTS (
       SELECT 1 FROM sys.columns
       WHERE object_id = OBJECT_ID(N'dbo.SOCIAL_EVENT')
         AND name = N'location'
         AND system_type_id <> 231
   )
    ALTER TABLE dbo.SOCIAL_EVENT ALTER COLUMN location NVARCHAR(180) NOT NULL;
