import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi di lingkungan server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Payload tidak valid: Body request harus berupa object JSON." },
        { status: 400 }
      );
    }

    const {
      institution = "SMP Qur'an Al-Hamidy",
      grade = "Kelas 7",
      subject = "Tahfizh Al-Qur'an & Tajwid",
      assessmentType = "Summative", // "Formative" or "Summative"
      assessmentTitle = "Sumatif Tengah Semester (STS) Ganjil",
      semester = "Ganjil",
      academicYear = "2025/2026",
      capaianPembelajaran = "",
      tujuanPembelajaran = "",
      topics = "",
      bloomsDistribution = { HOTS: 30, MOTS: 50, LOTS: 20 },
      questionCounts = {
        pilihanGanda: 5,
        pgKompleks: 2,
        menjodohkan: 2,
        isianSingkat: 2,
        uraian: 2,
      },
      customInstruction = "",
    } = body;

    if (
      typeof institution !== "string" ||
      typeof grade !== "string" ||
      typeof subject !== "string"
    ) {
      return NextResponse.json(
        { error: "Payload tidak valid: 'institution', 'grade', dan 'subject' harus berupa string." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `
Anda adalah Pakar Kurikulum Merdeka dan Tim Pengembang Soal Asesmen Pendidikan untuk sekolah berbasis Pesantren Qur'ani: ${institution} (SMP Qur'an Al-Hamidy atau SMA Plus Al-Hamidy Banyuanyar).

Buatlah paket dokumen soal asesmen yang komprehensif, berkualitas tinggi, presisi, dan sesuai Capaian Pembelajaran (CP) Kurikulum Merdeka.

DETAIL PERMINTAAN:
- Nama Lembaga: ${institution}
- Tingkat/Kelas: ${grade}
- Mata Pelajaran: ${subject}
- Jenis Asesmen: ${assessmentType === "Formative" ? "Asesmen Formatif (Ulangan Harian / Kuis Diagnostik)" : "Asesmen Sumatif (STS/SAS/SAT/Ujian Sekolah)"}
- Judul Asesmen: ${assessmentTitle}
- Semester: ${semester} | Tahun Ajaran: ${academicYear}
- Capaian Pembelajaran (CP): ${capaianPembelajaran || "Sesuai standar CP Kurikulum Merdeka Kemendikbudristek untuk mata pelajaran ini"}
- Tujuan Pembelajaran (TP): ${tujuanPembelajaran || "Sesuai TP relevan"}
- Topik/Materi Bahasan: ${topics || "Materi standar sesuai semester dan jenjang"}
- Proporsi Tingkat Kognitif (Bloom): HOTS (${bloomsDistribution.HOTS}%), MOTS (${bloomsDistribution.MOTS}%), LOTS (${bloomsDistribution.LOTS}%)
- Jumlah Soal per Bentuk:
  * Pilihan Ganda (PG Standard): ${questionCounts.pilihanGanda} soal
  * Pilihan Ganda Kompleks (PGK: Jawaban >1 / Benar-Salah): ${questionCounts.pgKompleks} soal
  * Menjodohkan (Matching): ${questionCounts.menjodohkan} soal
  * Isian Singkat: ${questionCounts.isianSingkat} soal
  * Uraian (Essay): ${questionCounts.uraian} soal
- Instruksi Tambahan Guru: ${customInstruction || "Sajikan soal kontekstual, islami bila relevan, dan bermakna."}

PETUNJUK KHUSUS MAPEL ISLAMI (Bila Mapel = Tahfizh, Tajwid, PAI, Nahwu/Shorof, Bahasa Arab):
- Sertakan teks Arab dengan harakat lengkap yang rapi dan benar apabila menyatukan ayat Al-Qur'an, Hadits, atau kaidah Nahwu/Shorof.
- Untuk mata pelajaran umum (Matematika, IPA, Fisika, Biologi, Kimia, Ekonomi, dll), gunakan konteks sains/aplikatif kehidupan sehari-hari yang santun dan relevan.

PETUNJUK STRUKTUR SOAL:
1. Pilihan Ganda (PG): Sediakan 4 pilihan jawaban (A, B, C, D) untuk SMP, atau 5 pilihan (A, B, C, D, E) untuk SMA.
2. Pilihan Ganda Kompleks (PGK): Sediakan 3-4 pernyataan dengan penentuan Benar/Salah atau Centang Pilihan Benar (>1 jawaban benar).
3. Menjodohkan: Sediakan daftar Kolom A (Pertanyaan/Pernyataan) dan Kolom B (Pasangan/Jawaban).
4. Isian Singkat: Soal langsung dengan kunci jawaban singkat yang tepat.
5. Uraian (Essay): Soal analisis/pemecahan masalah dilengkapi Kunci Jawaban & Rubrik Penilaian Skor Detail (misal: Skor 4 jika penjelasan lengkap, dst).

Setiap soal HARUS menyertakan:
- Stimulus (bila ada: narasi, tabel, ayat/hadits, studi kasus)
- Tingkat Kognitif Bloom (misal: C1, C2, C3, C4, C5, C6) & Kategori (LOTS/MOTS/HOTS)
- Elemen CP & Indikator Soal
- Kunci Jawaban & Pembahasan Detail
- Bobot Nilai (Score Weight)

Keluarkan hasilnya dalam format JSON yang valid dan lengkap sesuai struktur schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            institution: { type: Type.STRING },
            grade: { type: Type.STRING },
            subject: { type: Type.STRING },
            assessmentType: { type: Type.STRING },
            semester: { type: Type.STRING },
            academicYear: { type: Type.STRING },
            timeLimitMinutes: { type: Type.NUMBER },
            generalInstructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            summaryCP: { type: Type.STRING },
            summaryTP: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  number: { type: Type.INTEGER },
                  type: { type: Type.STRING }, // 'pilihan_ganda' | 'pg_kompleks' | 'menjodohkan' | 'isian_singkat' | 'uraian'
                  stimulus: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  complexSubItems: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        statement: { type: Type.STRING },
                        isTrue: { type: Type.BOOLEAN },
                      },
                    },
                  },
                  matchingPairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        left: { type: Type.STRING },
                        right: { type: Type.STRING },
                      },
                    },
                  },
                  answerKey: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  rubric: { type: Type.STRING },
                  bloomLevel: { type: Type.STRING }, // e.g. "C4 (HOTS)"
                  cpElement: { type: Type.STRING },
                  indikatorSoal: { type: Type.STRING },
                  scoreWeight: { type: Type.NUMBER },
                },
                required: [
                  "number",
                  "type",
                  "questionText",
                  "answerKey",
                  "explanation",
                ],
              },
            },
            kisiKisiMatrix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nomorSoal: { type: Type.INTEGER },
                  cpElement: { type: Type.STRING },
                  materi: { type: Type.STRING },
                  indikatorSoal: { type: Type.STRING },
                  bentukSoal: { type: Type.STRING },
                  levelKognitif: { type: Type.STRING },
                },
              },
            },
          },
          required: [
            "title",
            "institution",
            "grade",
            "subject",
            "questions",
          ],
        },
      },
    });

    let rawText = "";
    if (typeof response === "string") {
      rawText = response;
    } else if (response?.text) {
      rawText = response.text;
    } else if ((response as any)?.output?.[0]?.content) {
      const content = (response as any).output[0].content;
      rawText = Array.isArray(content)
        ? content.map((c: any) => c.text || c).join("")
        : (content.text || "");
    }

    if (!rawText) {
      return NextResponse.json(
        { error: "Gagal menerima respons teks dari layanan AI Gemini." },
        { status: 500 }
      );
    }

    // Strip markdown code fences if present
    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error("Gagal melakukan parse JSON dari Gemini response:", parseErr, "Raw Text:", cleanedText.slice(0, 300));
      return NextResponse.json(
        { error: "Format jawaban dari AI Gemini tidak dapat diparse sebagai JSON valid. Silakan coba lagi." },
        { status: 500 }
      );
    }

    if (!data || typeof data !== "object" || !Array.isArray(data.questions)) {
      return NextResponse.json(
        { error: "Dokumen soal yang dihasilkan tidak memenuhi struktur data yang valid." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in generate-exam API:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal pada server saat membuat dokumen soal." },
      { status: 500 }
    );
  }
}
