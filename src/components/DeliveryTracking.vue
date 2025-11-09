<script setup>
import { ref, computed } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import Swal from "sweetalert2";
import { tracking as trackingDummy, pengirimanList } from "../shared/mock.js";

// --- KONVERSI DATA DUMMY ---
const trackingList = ref(
  Object.entries(trackingDummy).map(([doNumber, data]) => ({
    doNumber,
    ...data,
  }))
);

// --- SCHEMA VALIDASI ---
const schema = yup.object({
  nim: yup.string().required("NIM wajib diisi"),
  nama: yup.string().required("Nama wajib diisi"),
  ekspedisi: yup.string().required("Ekspedisi wajib dipilih"),
  tanggalKirim: yup.date().required("Tanggal kirim wajib diisi"),
  paket: yup.string().required("Paket wajib dipilih"),
  total: yup.number().required("Total wajib diisi").min(1),
  status: yup.string().required(),
});

const { handleSubmit, resetForm } = useForm({ validationSchema: schema });

const fields = [
  "nim",
  "nama",
  "ekspedisi",
  "tanggalKirim",
  "paket",
  "total",
  "status",
];
const fieldRefs = Object.fromEntries(fields.map((f) => [f, useField(f)]));

const editingIndex = ref(null);

// --- GENERATE NOMOR DO ---
const nextDoNumber = computed(() => {
  const year = new Date().getFullYear();
  const seq = trackingList.value.length + 1;
  return `DO${year}-${String(seq).padStart(4, "0")}`;
});

// --- SIMPAN / UPDATE ---
const saveTracking = handleSubmit(async (values) => {
  if (editingIndex.value !== null) {
    trackingList.value[editingIndex.value] = {
      ...trackingList.value[editingIndex.value],
      ...values,
    };
    Swal.fire({
      icon: "success",
      title: "Data diperbarui",
      text: "Data tracking berhasil diperbarui!",
      timer: 1500,
      showConfirmButton: false,
    });
    editingIndex.value = null;
  } else {
    trackingList.value.push({
      doNumber: nextDoNumber.value,
      ...values,
      perjalanan: [
        {
          waktu: new Date().toLocaleString("id-ID"),
          keterangan: "Penerimaan di Loket: Jakarta",
        },
      ],
    });
    Swal.fire({
      icon: "success",
      title: "Data ditambahkan",
      text: "Data tracking baru berhasil disimpan!",
      timer: 1500,
      showConfirmButton: false,
    });
  }

  resetForm();
});

// --- EDIT DATA ---
const editTracking = (index) => {
  const t = trackingList.value[index];
  Object.entries(t).forEach(([key, val]) => {
    if (fieldRefs[key]) fieldRefs[key].value.value = val;
  });
  editingIndex.value = index;
};

// --- HAPUS DATA ---
const deleteTracking = async (index) => {
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
    trackingList.value.splice(index, 1);
    Swal.fire({
      icon: "success",
      title: "Terhapus!",
      text: "Data tracking berhasil dihapus.",
      timer: 1500,
      showConfirmButton: false,
    });
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto mt-10 bg-white p-6 rounded-lg shadow">
    <h1 class="text-2xl font-bold mb-6">Delivery Tracking</h1>

    <!-- FORM -->
    <form @submit.prevent="saveTracking" class="grid grid-cols-2 gap-4">
      <div>
        <label class="block font-medium mb-1">Nomor DO</label>
        <input
          type="text"
          :value="nextDoNumber"
          readonly
          class="w-full border rounded p-2 bg-gray-100"
        />
      </div>

      <template v-for="key in fields" :key="key">
        <div>
          <label class="block font-medium mb-1 capitalize">{{ key }}</label>

          <template v-if="key === 'ekspedisi'">
            <select
              v-model="fieldRefs[key].value.value"
              class="w-full border rounded p-2"
            >
              <option value="">Pilih Ekspedisi</option>
              <option v-for="e in pengirimanList" :key="e.kode" :value="e.kode">
                {{ e.kode }}
              </option>
            </select>
          </template>

          <template v-else-if="key === 'status'">
            <select
              v-model="fieldRefs[key].value.value"
              class="w-full border rounded p-2"
            >
              <option value="Dalam Perjalanan">Dalam Perjalanan</option>
              <option value="Terkirim">Terkirim</option>
              <option value="Gagal Dikirim">Gagal Dikirim</option>
            </select>
          </template>

          <template v-else-if="key === 'tanggalKirim'">
            <input
              v-model="fieldRefs[key].value.value"
              type="date"
              class="w-full border rounded p-2"
            />
          </template>

          <template v-else-if="key === 'total'">
            <input
              v-model="fieldRefs[key].value.value"
              type="number"
              class="w-full border rounded p-2"
            />
          </template>

          <template v-else>
            <input
              v-model="fieldRefs[key].value.value"
              type="text"
              class="w-full border rounded p-2"
            />
          </template>

          <p class="text-red-500 text-sm">
            {{ fieldRefs[key].errorMessage.value }}
          </p>
        </div>
      </template>

      <!-- Tombol -->
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
            resetForm();
            editingIndex = null;
          "
          class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Reset
        </button>
      </div>
    </form>

    <!-- TABLE -->
    <table class="w-full mt-8 border-collapse text-sm">
      <thead>
        <tr class="bg-gray-100 border-b text-left">
          <th class="p-3">Nomor DO</th>
          <th class="p-3">NIM</th>
          <th class="p-3">Nama</th>
          <th class="p-3">Ekspedisi</th>
          <th class="p-3">Tanggal Kirim</th>
          <th class="p-3">Paket</th>
          <th class="p-3">Total</th>
          <th class="p-3">Status</th>
          <th class="p-3">Aksi</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(item, index) in trackingList"
          :key="item.doNumber"
          class="border-b hover:bg-gray-50"
        >
          <td class="p-3 font-medium">{{ item.doNumber }}</td>
          <td class="p-3">{{ item.nim }}</td>
          <td class="p-3">{{ item.nama }}</td>
          <td class="p-3">{{ item.ekspedisi }}</td>
          <td class="p-3">{{ item.tanggalKirim }}</td>
          <td class="p-3">{{ item.paket }}</td>
          <td class="p-3">Rp {{ item.total.toLocaleString("id-ID") }}</td>
          <td class="p-3">
            <span
              :class="{
                'text-blue-600': item.status === 'Dalam Perjalanan',
                'text-green-600': item.status === 'Terkirim',
                'text-red-600': item.status === 'Gagal Dikirim',
              }"
              class="font-semibold"
              >{{ item.status }}</span
            >
          </td>
          <td class="p-3 flex gap-2">
            <button
              @click="editTracking(index)"
              class="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              @click="deleteTracking(index)"
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
