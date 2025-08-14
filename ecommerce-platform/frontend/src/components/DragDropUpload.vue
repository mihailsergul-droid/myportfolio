<template>
  <div 
    class="drag-drop-area"
    :class="{ 'drag-over': isDragOver, 'has-files': files.length > 0 }"
    @drop="handleDrop"
    @dragover.prevent="isDragOver = true"
    @dragleave="isDragOver = false"
    @click="$refs.fileInput.click()"
  >
    <input 
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      @change="handleFileSelect"
      class="file-input"
    >
    
    <div v-if="files.length === 0" class="upload-prompt">
      <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
      </svg>
      <p>Перетащите изображения или нажмите для выбора</p>
      <span>PNG, JPG до 5MB</span>
    </div>
    
    <div v-else class="file-preview">
      <div v-for="(file, index) in files" :key="index" class="file-item">
        <img :src="file.preview" :alt="file.name" class="file-thumbnail">
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
        </div>
        <button @click.stop="removeFile(index)" class="remove-btn">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  'files-changed': [files: File[]];
}>();

const isDragOver = ref(false);
const files = ref<Array<File & { preview: string }>>([]);

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;
  
  const droppedFiles = Array.from(e.dataTransfer?.files || []);
  processFiles(droppedFiles);
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const selectedFiles = Array.from(target.files || []);
  processFiles(selectedFiles);
};

const processFiles = (newFiles: File[]) => {
  newFiles.forEach(file => {
    if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileWithPreview = Object.assign(file, {
          preview: e.target?.result as string
        });
        files.value.push(fileWithPreview);
        emit('files-changed', files.value);
      };
      reader.readAsDataURL(file);
    }
  });
};

const removeFile = (index: number) => {
  files.value.splice(index, 1);
  emit('files-changed', files.value);
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.drag-drop-area {
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  background: var(--bg-secondary);
}

.drag-drop-area:hover,
.drag-drop-area.drag-over {
  border-color: var(--primary);
  background: rgb(99 102 241 / 0.05);
}

.file-input {
  display: none;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.upload-prompt svg {
  color: var(--primary);
}

.upload-prompt p {
  margin: 0;
  font-weight: 500;
  color: var(--text-primary);
}

.upload-prompt span {
  font-size: 0.875rem;
}

.file-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  position: relative;
}

.file-thumbnail {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: var(--danger);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  flex-shrink: 0;
}

.remove-btn:hover {
  transform: scale(1.1);
}

@media (max-width: 640px) {
  .file-preview {
    grid-template-columns: 1fr;
  }
  
  .drag-drop-area {
    padding: 24px 16px;
  }
}
</style>