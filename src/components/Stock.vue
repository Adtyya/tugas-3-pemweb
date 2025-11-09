<script setup>
import { ref, computed } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { stok as dummyStock, kategoriList, upbjjList } from "../shared/mock.js";
import Swal from "sweetalert2";

// --- DATA ---
const stocks = ref([...dummyStock]);
const editingIndex = ref(null);
const sortKey = ref("");
const sortOrder = ref("asc");

// --- VALIDATION SCHEMA ---
const schema = yup.object({
  kode: yup.string().required("Kode wajib diisi"),
  judul: yup.string().required("Judul wajib diisi"),
  kategori: yup.string().required("Kategori wajib diisi"),
  upbjj: yup.string().required("UPBJJ wajib diisi"),
  lokasiRak: yup.string().required("Lokasi Rak wajib diisi"),
  harga: yup
    .number()
    .typeError("Harga harus berupa angka")
    .required("Harga wajib diisi")
    .positive(),
  qty: yup
    .number()
    .typeError("Qty harus berupa angka")
    .required("Qty wajib diisi")
    .integer()
    .min(0),
  safety: yup
    .number()
    .typeError("Safety harus berupa angka")
    .required("Safety wajib diisi")
    .integer()
    .min(0),
  catatanHTML: yup.string().nullable(),
});

// --- FORM ---
const { handleSubmit, resetForm } = useForm({ validationSchema: schema });

// buat field secara dinamis
const fields = [
  "kode",
  "judul",
  "kategori",
  "upbjj",
  "lokasiRak",
  "harga",
  "qty",
  "safety",
  "catatanHTML",
];
const fieldRefs = Object.fromEntries(fields.map((f) => [f, useField(f)]));

// --- SAVE / UPDATE ---
const saveStock = handleSubmit(async (values) => {
  if (editingIndex.value !== null) {
    // Update data
    stocks.value[editingIndex.value] = { ...values };
    editingIndex.value = null;

    Swal.fire({
      icon: "success",
      title: "Data diperbarui",
      text: "Data stok berhasil diperbarui!",
      timer: 1500,
      showConfirmButton: false,
    });
  } else {
    // Tambah baru
    stocks.value.push({ ...values });

    Swal.fire({
      icon: "success",
      title: "Data ditambahkan",
      text: "Data stok baru berhasil disimpan!",
      timer: 1500,
      showConfirmButton: false,
    });
  }

  resetForm();
});

// --- EDIT ---
const editStock = (index) => {
  const stock = stocks.value[index];
  Object.entries(stock).forEach(([key, val]) => {
    if (fieldRefs[key]) fieldRefs[key].value.value = val;
  });
  editingIndex.value = index;
};

// --- DELETE ---
const deleteStock = async (index) => {
  const result = await Swal.fire({
    title: "Yakin ingin menghapus?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6b7280",
  });

  if (result.isConfirmed) {
    stocks.value.splice(index, 1);
    if (editingIndex.value === index) {
      resetForm();
      editingIndex.value = null;
    }
    Swal.fire({
      icon: "success",
      title: "Terhapus!",
      text: "Data stok berhasil dihapus.",
      timer: 1500,
      showConfirmButton: false,
    });
  }
};

// --- SORT ---
const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
};

const sortedStocks = computed(() => {
  if (!sortKey.value) return stocks.value;
  return [...stocks.value].sort((a, b) => {
    const aVal = a[sortKey.value];
    const bVal = b[sortKey.value];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder.value === "asc" ? aVal - bVal : bVal - aVal;
    }
    return sortOrder.value === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
});

// --- STATUS STOK ---
const getStockStatus = (item) => {
  if (item.qty === 0) return { label: "Kosong", color: "text-red-600" };
  if (item.qty < item.safety)
    return { label: "Menipis", color: "text-orange-500" };
  return { label: "Aman", color: "text-green-600" };
};
</script>

<template>
  <div class="max-w-7xl mx-auto mt-10 bg-white p-6 rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-6">Manajemen Stok Bahan Ajar</h1>

    <!-- FORM -->
    <form @submit.prevent="saveStock" class="grid grid-cols-2 gap-4">
      <div v-for="key in fields.filter((f) => f !== 'catatanHTML')" :key="key">
        <label class="block font-medium mb-1 capitalize">{{ key }}</label>

        <!-- Select untuk Kategori -->
        <select
          v-if="key === 'kategori'"
          v-model="fieldRefs[key].value.value"
          class="w-full border rounded p-2"
        >
          <option value="">Pilih Kategori</option>
          <option
            v-for="(kategori, i) in kategoriList"
            :key="i"
            :value="kategori"
          >
            {{ kategori }}
          </option>
        </select>

        <!-- Select untuk UPBJJ -->
        <select
          v-else-if="key === 'upbjj'"
          v-model="fieldRefs[key].value.value"
          class="w-full border rounded p-2"
        >
          <option value="">Pilih UPBJJ</option>
          <option v-for="(upbjj, i) in upbjjList" :key="i" :value="upbjj">
            {{ upbjj }}
          </option>
        </select>

        <!-- Input umum -->
        <input
          v-else
          v-model="fieldRefs[key].value.value"
          :type="['harga', 'qty', 'safety'].includes(key) ? 'number' : 'text'"
          :placeholder="key"
          class="w-full border rounded p-2"
        />

        <p class="text-red-500 text-sm">
          {{ fieldRefs[key].errorMessage.value }}
        </p>
      </div>

      <!-- CATATAN -->
      <div class="col-span-2">
        <label class="block font-medium mb-1">Catatan</label>
        <textarea
          v-model="fieldRefs.catatanHTML.value.value"
          rows="2"
          class="w-full border rounded p-2"
          placeholder="Tambahkan catatan (opsional)"
        ></textarea>
      </div>

      <!-- BUTTON -->
      <div class="col-span-2 flex gap-2 mt-3">
        <button
          type="submit"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {{ editingIndex !== null ? "Update" : "Tambah" }}
        </button>
        <button
          type="button"
          @click="
            () => {
              resetForm();
              editingIndex.value = null;
            }
          "
          class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Reset
        </button>
      </div>
    </form>

    <!-- TABLE -->
    <table class="w-full mt-8 border-collapse">
      <thead>
        <tr class="bg-gray-100 border-b text-left">
          <th
            v-for="key in [
              'kode',
              'judul',
              'kategori',
              'upbjj',
              'qty',
              'safety',
              'harga',
            ]"
            :key="key"
            class="p-3 cursor-pointer select-none"
            @click="sortBy(key)"
          >
            <div class="flex items-center gap-1">
              <span class="capitalize">{{ key }}</span>
              <span v-if="sortKey === key">
                {{ sortOrder === "asc" ? "▲" : "▼" }}
              </span>
            </div>
          </th>
          <th class="p-3">Status</th>
          <th class="p-3">Catatan</th>
          <th class="p-3">Aksi</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(item, index) in sortedStocks"
          :key="item.kode"
          class="border-b hover:bg-gray-50"
        >
          <td class="p-3 font-medium">{{ item.kode }}</td>
          <td class="p-3">{{ item.judul }}</td>
          <td class="p-3">{{ item.kategori }}</td>
          <td class="p-3">{{ item.upbjj }}</td>
          <td class="p-3">{{ item.qty }}</td>
          <td class="p-3">{{ item.safety }}</td>
          <td class="p-3">{{ item.harga.toLocaleString("id-ID") }}</td>
          <td class="p-3">
            <span
              :class="getStockStatus(item).color"
              class="font-semibold flex items-center gap-1"
            >
              {{ getStockStatus(item).label }}
            </span>
          </td>
          <td class="p-3" v-html="item.catatanHTML"></td>
          <td class="p-3 flex gap-2">
            <button
              @click="editStock(index)"
              class="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              @click="deleteStock(index)"
              class="text-red-600 hover:underline"
            >
              Hapus
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
