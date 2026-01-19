import fs from 'fs'
import path from 'path'

// Source directory
const sharedPagesDir = path.join(process.cwd(), 'src/app/[lang]/(shared)/pages')

// List of valid directories that should remain
const validDirs = [
  'account-settings',
  'dialog-examples',
  'faq',
  'misc',
  'pricing',
  'user-profile',
  'widget-examples',
  'wizard-examples'
]

// Function to remove invalid files and empty directories
function cleanDirectory(directory: string) {
  const items = fs.readdirSync(directory, { withFileTypes: true })

  for (const item of items) {
    const itemPath = path.join(directory, item.name)

    // Remove VerticalMenu.tsx if it exists
    if (item.isFile() && item.name === 'VerticalMenu.tsx') {
      console.log(`Removing file: ${itemPath}`)
      fs.unlinkSync(itemPath)
      continue
    }

    // Process directories
    if (item.isDirectory()) {
      // Check if it's a valid directory
      if (validDirs.includes(item.name)) {
        // Check if directory is empty
        const dirItems = fs.readdirSync(itemPath)

        if (dirItems.length === 0) {
          console.log(`Removing empty directory: ${itemPath}`)
          fs.rmdirSync(itemPath)
        } else {
          // Recursively clean subdirectories
          cleanDirectory(itemPath)
        }
      } else {
        console.log(`Removing invalid directory: ${itemPath}`)
        fs.rmSync(itemPath, { recursive: true, force: true })
      }
    }
  }

  // Check if the current directory is now empty
  const remainingItems = fs.readdirSync(directory)

  if (remainingItems.length === 0 && directory !== sharedPagesDir) {
    console.log(`Removing empty directory: ${directory}`)
    fs.rmdirSync(directory)
  }
}

// Start cleaning
console.log('Starting cleanup of shared pages directory...')

try {
  cleanDirectory(sharedPagesDir)
  console.log('Cleanup completed successfully.')
} catch (error) {
  console.error('Error during cleanup:', error)
  process.exit(1)
}
