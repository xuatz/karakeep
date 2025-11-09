package app.hoarder.androidshareintent

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class AndroidShareIntentModule : Module() {
  private var currentShareData: Bundle? = null
  private var hasNewShareIntent = false

  override fun definition() = ModuleDefinition {
    Name("AndroidShareIntent")

    // Called when JS checks if there's a share intent
    Function("hasShareIntent") {
      return@Function hasNewShareIntent
    }

    // Called when JS retrieves the share data
    Function("getShareIntent") {
      val shareData = currentShareData?.let { data ->
        val result = HashMap<String, Any?>()
        
        val text = data.getString("text")
        val url = data.getString("url")
        val type = data.getString("type")
        val fileUri = data.getString("fileUri")
        val fileName = data.getString("fileName")
        
        if (text != null) result["text"] = text
        if (url != null) result["webUrl"] = url
        if (type != null && fileUri != null) {
          val files = ArrayList<HashMap<String, Any?>>()
          val file = HashMap<String, Any?>()
          file["path"] = fileUri
          file["mimeType"] = type
          if (fileName != null) file["fileName"] = fileName
          files.add(file)
          result["files"] = files
        }
        
        result
      } ?: HashMap<String, Any?>()
      
      return@Function shareData
    }

    // Called when JS is done processing the share intent
    Function("resetShareIntent") {
      currentShareData = null
      hasNewShareIntent = false
    }

    // Called from MainActivity to handle the intent
    Function("handleIntent") { intent: Intent ->
      processIntent(intent)
    }

    OnActivityResult { _, (requestCode, resultCode, data) ->
      // Handle any activity results if needed
    }

    OnCreate {
      // Initialize when module is created
      appContext.currentActivity?.let { activity ->
        processIntent(activity.intent)
      }
    }

    OnNewIntent { intent ->
      // Handle new intents while app is running
      processIntent(intent)
    }
  }

  private fun processIntent(intent: Intent) {
    val action = intent.action
    val type = intent.type

    if (Intent.ACTION_SEND == action && type != null) {
      val shareData = Bundle()
      hasNewShareIntent = true

      when {
        type.startsWith("text/") -> {
          // Handle text content
          intent.getStringExtra(Intent.EXTRA_TEXT)?.let { text ->
            // Check if it's a URL
            if (text.startsWith("http://") || text.startsWith("https://")) {
              shareData.putString("url", text)
            } else {
              shareData.putString("text", text)
            }
          }
        }
        type.startsWith("image/") || type == "application/pdf" -> {
          // Handle file content
          (intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM))?.let { fileUri ->
            shareData.putString("fileUri", fileUri.toString())
            shareData.putString("type", type)
            
            // Try to get file name
            appContext.currentActivity?.let { activity ->
              try {
                activity.contentResolver.query(fileUri, null, null, null, null)?.use { cursor ->
                  val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                  if (nameIndex >= 0 && cursor.moveToFirst()) {
                    val fileName = cursor.getString(nameIndex)
                    shareData.putString("fileName", fileName)
                  }
                }
              } catch (e: Exception) {
                // Ignore errors getting file name
              }
            }
          }
        }
      }

      if (!shareData.isEmpty) {
        currentShareData = shareData
      }
    }
  }
}
