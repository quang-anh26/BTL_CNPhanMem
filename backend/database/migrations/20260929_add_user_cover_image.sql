USE messaging_db;
GO

IF COL_LENGTH('dbo.USERS', 'cover_image') IS NULL
BEGIN
    ALTER TABLE dbo.USERS ADD cover_image VARCHAR(500) NULL;
END
GO

IF COL_LENGTH('dbo.USERS', 'education') IS NULL
    ALTER TABLE dbo.USERS ADD education NVARCHAR(120) NULL;
GO

IF COL_LENGTH('dbo.USERS', 'location') IS NULL
    ALTER TABLE dbo.USERS ADD location NVARCHAR(120) NULL;
GO

IF COL_LENGTH('dbo.USERS', 'relationship_status') IS NULL
    ALTER TABLE dbo.USERS ADD relationship_status NVARCHAR(40) NULL;
GO

IF COL_LENGTH('dbo.USERS', 'birth_date') IS NULL
    ALTER TABLE dbo.USERS ADD birth_date DATE NULL;
GO
