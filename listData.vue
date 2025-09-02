<template>
  <v-sheet
    class="pa-4"
    color="#f0f2f5"
    style="min-height: 100vh; font-family: 'Prompt', sans-serif;"
  >
    <v-container class="py-6">
      <v-card class="rounded-xl elevation-6" color="white">
        <!-- Toolbar -->
        <v-toolbar flat class="rounded-t-xl" color="blue-grey-lighten-5">
          <v-icon color="blue-grey-darken-2" icon="mdi-book-multiple"></v-icon>
          <v-toolbar-title class="text-blue-grey-darken-3 font-weight-bold ml-2">
            Book Manager
          </v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn
            color="blue-grey-darken-1"
            prepend-icon="mdi-plus"
            rounded="lg"
            variant="elevated"
            @click="add"
          >
            Add Book
          </v-btn>
        </v-toolbar>

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="books"
          class="bg-white"
          :hide-default-footer="books.length < 11"
          density="comfortable"
        >
          <!-- Status -->
          <template v-slot:item.status="{ value }">
            <v-chip
              :color="value === 'good' ? 'green-lighten-2' : 'red-lighten-2'"
              text-color="black"
              size="small"
              label
              class="font-weight-bold"
            >
              {{ value }}
            </v-chip>
          </template>

          <!-- Actions -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex ga-2 justify-end">
              <v-btn
                icon="mdi-pencil"
                size="small"
                color="blue-grey-darken-1"
                variant="text"
                @click="edit(item.id)"
              ></v-btn>

              <v-btn
                icon="mdi-delete"
                size="small"
                color="red-lighten-1"
                variant="text"
                @click="remove(item.id)"
              ></v-btn>
            </div>
          </template>

          <!-- No data -->
          <template v-slot:no-data>
            <div class="pa-4 text-center">
              <v-btn
                prepend-icon="mdi-backup-restore"
                text="Reset Data"
                color="blue-grey-darken-1"
                variant="outlined"
                @click="reset"
              ></v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="bg-blue-grey-darken-2 text-white font-weight-bold">
          {{ isEditing ? 'Edit Book' : 'Add Book' }}
        </v-card-title>

        <v-card-text class="py-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formModel.email"
                label="Email"
                variant="outlined"
                density="comfortable"
                color="blue-grey"
                class="rounded-lg"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formModel.password"
                label="Password"
                variant="outlined"
                density="comfortable"
                color="blue-grey"
                class="rounded-lg"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formModel.status"
                label="Status"
                variant="outlined"
                density="comfortable"
                color="blue-grey"
                class="rounded-lg"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formModel.dep"
                label="Department"
                variant="outlined"
                density="comfortable"
                color="blue-grey"
                class="rounded-lg"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="grey" @click="dialog = false">Cancel</v-btn>
          <v-btn color="blue-grey-darken-1" variant="elevated" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted } from 'vue';

// Define the data model for a new record
function createNewRecord() {
  return {
    id: '',
    email: '',
    password: '',
    status: '',
    dep: ''
  };
}

// Reactive variables for the component's state
const books = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = computed(() => !!formModel.value.id);

// Define the table headers
const headers = [
  { title: 'ID', key: 'id', align: 'start' },
  { title: 'Email', key: 'email' },
  { title: 'Password', key: 'password' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Department', key: 'dep', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'end' }
];

// Life cycle hook to initialize data
onMounted(() => {
  reset();
});

// Function to open the add dialog
function add() {
  formModel.value = createNewRecord();
  dialog.value = true;
}

// Function to open the edit dialog and populate the form
function edit(id) {
  const found = books.value.find(book => book.id === id);
  if (found) {
    formModel.value = { ...found };
    dialog.value = true;
  }
}

// Function to remove a record
function remove(id) {
  const index = books.value.findIndex(book => book.id === id);
  if (index !== -1) books.value.splice(index, 1);
}

// Function to save or update a record
function save() {
  if (isEditing.value) {
    const index = books.value.findIndex(book => book.id === formModel.value.id);
    if (index !== -1) books.value[index] = { ...formModel.value };
  } else {
    formModel.value.id = books.value.length > 0 ? Math.max(...books.value.map(b => b.id)) + 1 : 1;
    books.value.push({ ...formModel.value });
  }
  dialog.value = false;
}

// Function to reset the data to its initial state
function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  books.value = [
    { id: 1, email: 'isusiot@gmail.com', password: '123456', status: 'single', dep: 'IT' },
    { id: 2, email: 'OPPPPP@gmail.com', password: '123456', status: 'good', dep: 'Dev' },
    { id: 3, email: 'POPPY@gmail.com', password: '123456', status: 'good', dep: 'WHAT ' }
  ];
}
</script>

<style scoped>
/*
  Note: Most of the styling is handled by Vuetify classes.
  You can add custom styles here if needed.
*/
.v-container {
  max-width: 1200px;
}
</style>
