import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add current directory to path so we can import storage
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from storage.azure_storage import AzureBlobStorage

def migrate():
    # Load environment variables
    load_dotenv()
    
    print("Starting migration of files to Azure Blob Storage...")
    
    # Check if Azure storage is configured
    try:
        azure_storage = AzureBlobStorage()
        print(f"Connected to Azure Blob Storage container: {azure_storage.container_name}")
    except Exception as e:
        print(f"Error initializing Azure Blob Storage: {e}")
        return

    # Define the uploads directory
    uploads_dir = Path("uploads")
    if not uploads_dir.exists():
        print(f"Uploads directory '{uploads_dir}' not found. Nothing to migrate.")
        return

    # Count files for progress
    all_files = list(uploads_dir.glob("**/*"))
    files_to_migrate = [f for f in all_files if f.is_file()]
    total_files = len(files_to_migrate)
    
    print(f"Found {total_files} files to migrate.")

    success_count = 0
    fail_count = 0

    for i, file_path in enumerate(files_to_migrate):
        try:
            # Get relative path from uploads
            relative_path = file_path.relative_to(uploads_dir)
            folder = str(relative_path.parent).replace('\\', '/')
            if folder == '.':
                folder = ""
            
            filename = file_path.name
            
            print(f"[{i+1}/{total_files}] Migrating: {relative_path} ...", end="", flush=True)
            
            with open(file_path, 'rb') as f:
                content = f.read()
                # Use preserve_name=True to keep the same path in Azure
                azure_storage.upload(content, filename=filename, folder=folder, preserve_name=True)
            
            print(" DONE")
            success_count += 1
        except Exception as e:
            print(f" FAILED: {e}")
            fail_count += 1

    print("\n--- Migration Summary ---")
    print(f"Total Files: {total_files}")
    print(f"Successfully Migrated: {success_count}")
    print(f"Failed: {fail_count}")
    
    if fail_count == 0 and total_files > 0:
        print("\nAll files migrated successfully!")
    elif total_files > 0:
        print("\nSome files failed to migrate. Please check the logs above.")
    else:
        print("\nNothing was migrated.")

if __name__ == "__main__":
    migrate()
