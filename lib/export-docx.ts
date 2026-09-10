import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";
import { ExamDocument, Question } from "@/types/exam";

export async function exportToDocx(exam: ExamDocument, versionLabel: string = "PAKET A") {
  const { kopConfig, sigConfig, questions } = exam;

  // Group questions by type
  const pgQuestions = questions.filter((q) => q.type === "pilihan_ganda");
  const pgkQuestions = questions.filter((q) => q.type === "pg_kompleks");
  const matchQuestions = questions.filter((q) => q.type === "menjodohkan");
  const isianQuestions = questions.filter((q) => q.type === "isian_singkat");
  const uraianQuestions = questions.filter((q) => q.type === "uraian");

  const children: (Paragraph | Table)[] = [];

  // 1. KOP SURAT
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: kopConfig.yayasanName.toUpperCase(),
          bold: true,
          size: 20, // 10pt
          font: "Times New Roman",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: kopConfig.institutionName.toUpperCase(),
          bold: true,
          size: 28, // 14pt
          font: "Times New Roman",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${kopConfig.akreditasi} | ${kopConfig.npsnNss}`,
          bold: true,
          size: 18, // 9pt
          font: "Times New Roman",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: kopConfig.address,
          size: 18,
          font: "Times New Roman",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${kopConfig.phoneEmail} | Web: ${kopConfig.website}`,
          size: 18,
          font: "Times New Roman",
        }),
      ],
    })
  );

  // Divider Line
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "━".repeat(60),
          bold: true,
          size: 18,
          font: "Times New Roman",
        }),
      ],
    })
  );

  // 2. DOCUMENT TITLE & METADATA
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: `${exam.title.toUpperCase()} [${versionLabel}]`,
          bold: true,
          size: 24, // 12pt
          font: "Times New Roman",
        }),
      ],
    })
  );

  // Metadata Table
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Satuan Pendidikan : ", bold: true, font: "Times New Roman", size: 18 }),
                  new TextRun({ text: exam.institution, font: "Times New Roman", size: 18 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Mata Pelajaran    : ", bold: true, font: "Times New Roman", size: 18 }),
                  new TextRun({ text: exam.subject, font: "Times New Roman", size: 18 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Kelas / Tingkat   : ", bold: true, font: "Times New Roman", size: 18 }),
                  new TextRun({ text: exam.grade, font: "Times New Roman", size: 18 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Semester / T.A.  : ", bold: true, font: "Times New Roman", size: 18 }),
                  new TextRun({ text: `${exam.semester} / ${exam.academicYear}`, font: "Times New Roman", size: 18 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Alokasi Waktu     : ", bold: true, font: "Times New Roman", size: 18 }),
                  new TextRun({ text: `${exam.timeLimitMinutes} Menit`, font: "Times New Roman", size: 18 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Versi Dokumen     : ", bold: true, font: "Times New Roman", size: 18 }),
                  new TextRun({ text: versionLabel, bold: true, font: "Times New Roman", size: 18 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
  children.push(metaTable);

  // Petunjuk Umum
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: "PETUNJUK UMUM PENGERJAAN:",
          bold: true,
          size: 18,
          font: "Times New Roman",
        }),
      ],
    })
  );

  exam.generalInstructions.forEach((inst, idx) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${idx + 1}. ${inst}`,
            size: 18,
            font: "Times New Roman",
          }),
        ],
      })
    );
  });

  // Helper for Questions
  const addQuestionGroup = (title: string, groupQuestions: Question[]) => {
    if (groupQuestions.length === 0) return;

    children.push(
      new Paragraph({
        spacing: { before: 300, after: 100 },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 20,
            font: "Times New Roman",
          }),
        ],
      })
    );

    groupQuestions.forEach((q) => {
      // Stimulus
      if (q.stimulus) {
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({
                text: `[STIMULUS]: ${q.stimulus}`,
                italics: true,
                size: 18,
                font: "Times New Roman",
              }),
            ],
          })
        );
      }

      // Question text
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 50 },
          children: [
            new TextRun({
              text: `${q.number}. `,
              bold: true,
              size: 20,
              font: "Times New Roman",
            }),
            new TextRun({
              text: q.questionText,
              size: 20,
              font: "Times New Roman",
            }),
          ],
        })
      );

      // Options for PG
      if (q.type === "pilihan_ganda" && q.options) {
        q.options.forEach((opt) => {
          children.push(
            new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({
                  text: opt,
                  size: 18,
                  font: "Times New Roman",
                }),
              ],
            })
          );
        });
      }

      // PGK Table or sub-items
      if (q.type === "pg_kompleks" && q.complexSubItems) {
        q.complexSubItems.forEach((sub, sIdx) => {
          children.push(
            new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({
                  text: `[  ] ${sub.statement}`,
                  size: 18,
                  font: "Times New Roman",
                }),
              ],
            })
          );
        });
      }

      // Menjodohkan
      if (q.type === "menjodohkan" && q.matchingPairs) {
        q.matchingPairs.forEach((pair, pIdx) => {
          children.push(
            new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({
                  text: `${pIdx + 1}. ${pair.left}  <----->  ${pair.right}`,
                  size: 18,
                  font: "Times New Roman",
                }),
              ],
            })
          );
        });
      }
    });
  };

  addQuestionGroup("I. PILIHAN GANDA", pgQuestions);
  addQuestionGroup("II. PILIHAN GANDA KOMPLEKS", pgkQuestions);
  addQuestionGroup("III. MENJODOHKAN", matchQuestions);
  addQuestionGroup("IV. ISIAN SINGKAT", isianQuestions);
  addQuestionGroup("V. URAIAN / ESSAY", uraianQuestions);

  // 5. SIGNATURE BLOCK
  const sigTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Mengetahui,", size: 18, font: "Times New Roman" }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: sigConfig.principalTitle, bold: true, size: 18, font: "Times New Roman" }),
                ],
              }),
              new Paragraph({ children: [new TextRun({ text: "\n\n\n", size: 18 })] }), // gap for signature
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: sigConfig.principalName, bold: true, underline: {}, size: 18, font: "Times New Roman" }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: sigConfig.principalNip, size: 16, font: "Times New Roman" }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: sigConfig.locationDate, size: 18, font: "Times New Roman" }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: sigConfig.teacherTitle, bold: true, size: 18, font: "Times New Roman" }),
                ],
              }),
              new Paragraph({ children: [new TextRun({ text: "\n\n\n", size: 18 })] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: sigConfig.teacherName, bold: true, underline: {}, size: 18, font: "Times New Roman" }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: sigConfig.teacherNip, size: 16, font: "Times New Roman" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  children.push(
    new Paragraph({ spacing: { before: 400, after: 100 }, children: [] }),
    sigTable
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = exam.title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_");
  const fileName = `${cleanTitle}_${versionLabel.replace(/\s+/g, "_")}.docx`;

  try {
    const fileSaver = await import("file-saver");
    const saveAsFn = fileSaver.saveAs || (fileSaver as any).default?.saveAs || (fileSaver as any).default;
    if (typeof saveAsFn === "function") {
      saveAsFn(blob, fileName);
      return;
    }
  } catch {
    // Fallback to native browser download if dynamic import fails
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
