BACKEND UPDATES/FIX

1. create endpoints for the 'action', 'setting', 'mode' in still images/ style preset mode and images and visuals in still/edit style.

2. Generate still image returns `DISPATCH_FAILED` error:
   ```json
   {
     "success": false,
     "message": "Failed to dispatch generation request",
     "error": "DISPATCH_FAILED"
   }
   ```
   Backend receives request but fails to queue it to the generation worker. Fix dispatch pipeline.

3. Generate image `VALIDATION_ERROR` — two variants from still image generation:
   ```json
   { "success": false, "error": "VALIDATION_ERROR", "message": "Array must contain at least 1 element(s)" }
   { "success": false, "error": "VALIDATION_ERROR", "message": "Invalid enum value. Expected 'cinematic' | 'realistic', received 'eclipse'" }
   ```
   **Backend needs to clarify / document:**
   - What is the full list of valid `visual` enum values? Currently only `cinematic | realistic` accepted — where do `spark`, `eclipse` (edit style models) fit?
   - Is `character_ids` required for all still image modes? Or only for style-present?
   - How should each mode (`style_present`, `edit_style`) differ in the request payload?
   - Is there a separate endpoint or field for edit-style model selection?

   Frontend is blocked on correct payload shape until backend documents each mode's expected request.

4. make me a premiuem user and unlimited coin for testing
