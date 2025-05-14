async function replyText(client, replyToken, text, quoteToken, userId) {
  try {
    console.log('เข้า replyText', text);
    console.log('text.length:', text.length);

    const chunkSize = 5;
    const chunks = [];

    // แบ่งข้อความเป็น array ย่อย ๆ ละ 5 ข้อความ
    for (let i = 0; i < text.length; i += chunkSize) {
      console.log('For loop :', i);
      console.log('chunks loop :', chunks);
      chunks.push(text.slice(i, i + chunkSize));
    }
    console.log('Out loop');
    // ส่งก้อนแรกด้วย replyMessage
    const firstChunk = chunks[0];
    const replyMessages = firstChunk.map(txt => ({
      type: 'text',
      text: txt,
      quoteToken
    }));
    console.log('replyMessages :', replyMessages);

    return await client.replyMessage({
      replyToken,
      messages: replyMessages
    });

    // ถ้ามีข้อความเหลือ ส่งต่อด้วย pushMessage
    /*for (let i = 1; i < chunks.length; i++) {
      const pushMessages = chunks[i].map(txt => ({
        type: 'text',
        text: txt
      }));
      console.error('chunks :', chunks[i]);
      console.error('pushMessages:', pushMessages);
      await client.pushMessage(userId, {
        messages: pushMessages
      });
    }*/

  } catch (err) {
    console.error('Error sending message:', err);
  }
}

async function test2(client, replyToken) {

  const data = [
    { date: '25/04/2568', type: 'รายรับ', descrip: 'ทดสอบรายรับ', amount: 10000 },
    { date: '26/04/2568', type: 'รายจ่าย', descrip: 'ค่าข้าว', amount: 200 },
    { date: '27/04/2568', type: 'รายจ่าย', descrip: 'ค่าเดินทาง', amount: 150 }
  ];
  /*
  // แปลงข้อมูลเป็น bubbles
  const bubbles = data.map(item => ({
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: `${item.date}`,
          weight: "bold",
          size: "md",
          margin: "md"
        },
        {
          type: "text",
          text: `${item.type}: ${item.descrip}`,
          size: "sm",
          wrap: true
        },
        {
          type: "text",
          text: `จำนวนเงิน: ${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2})} บาท`,
          size: "sm",
          wrap: true,
          color: "#555555",
          align: end
        }
      ]
    }
  }));
  
  // ประกอบร่างเป็น carousel
  const replyMessages = {
    type: "flex",
    altText: "ข้อมูลรายรับ-รายจ่าย",
    contents: {
      type: "carousel",
      contents: bubbles
    }
  };
  
  // ส่งข้อความ
  await client.replyMessage({
    replyToken,
    messages: [replyMessages]
  });
  */

  /*const rows = [
    { item: 'Energy Drink', price: 2.99 },
    { item: 'Chewing Gum', price: 0.99 },
    { item: 'Bottled Water', price: 3.33 }
  ];*/

  // สร้าง body.contents ของ Flex อัตโนมัติ รายการจาก select
  const itemContents = data.map(row => ({
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: row.type + ":",
        size: "sm",
        color: row.type === 'รายรับ' ? "#00C853" : "#DC143C",
        flex: 0
      }, {
        type: "text",
        text: row.descrip,
        size: "sm",
        color: "#555555",
        flex: 0
      },
      {
        type: "text",
        text: `$${row.amount.toFixed(2)}`,
        size: "sm",
        color: row.type === 'รายรับ' ? "#00C853" : "#DC143C",
        align: "end"
      }
    ]
  }));

  // เพิ่ม separator กับสรุปรายการ
  itemContents.push(
    { type: "separator", margin: "md" },
    {
      type: "box",
      layout: "horizontal",
      margin: "md",
      contents: [
        { type: "text", text: "ITEMS", size: "sm", color: "#555555" },
        { type: "text", text: `${data.length}`, size: "sm", color: "#111111", align: "end" }
      ]
    }
  );

  // รวมราคาทั้งหมด
  const total = data.reduce((sum, row) => sum + row.amount, 0);

  // เพิ่ม total, cash, change
  itemContents.push(
    {
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: "TOTAL", size: "sm", color: "#555555" },
        { type: "text", text: `$${total.toFixed(2)}`, size: "sm", color: "#111111", align: "end" }
      ]
    },
    {
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: "CASH", size: "sm", color: "#555555" },
        { type: "text", text: "$8.00", size: "sm", color: "#111111", align: "end" }
      ]
    },
    {
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: "CHANGE", size: "sm", color: "#555555" },
        { type: "text", text: `$${(8.00 - total).toFixed(2)}`, size: "sm", color: "#111111", align: "end" }
      ]
    }
  );

  // Flex Message เต็ม
  const replyMessages = {
    type: "flex",
    altText: "ใบเสร็จรายการ",
    contents: {
      type: "bubble",
      styles: {
        header: { backgroundColor: "#ffffff" },
        body: { backgroundColor: "#ffffff" }
      },
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "RECEIPT", color: "#00C853", weight: "bold", size: "md" },
          { type: "text", text: "26/04/2568", weight: "bold", size: "xl", margin: "md" },
          { type: "text", text: "Bangkok, Thailand", size: "xs", color: "#aaaaaa", wrap: true, margin: "sm" }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: itemContents
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          { type: "text", text: "PAYMENT ID", size: "xs", color: "#aaaaaa", wrap: true },
          { type: "text", text: "#743289384279", size: "xs", color: "#aaaaaa", wrap: true }
        ]
      }
    }
  };

  // ส่งออก
  await client.replyMessage({
    replyToken,
    messages: [replyMessages]
  });

}

async function replyDetail(client, replyToken, rows, sum_amt) {
  try {
    /*const rows = [
      { date: '26/04/2568', type: 'รายรับ', descrip: 'ทดสอบรายรับ', amount: 10000 },
      { date: '26/04/2568', type: 'รายจ่าย', descrip: 'ค่าข้าว', amount: 200 },
      { date: '26/04/2568', type: 'รายจ่าย', descrip: 'ค่าเดินทาง', amount: 150 },
      { date: '27/04/2568', type: 'รายรับ', descrip: 'ขายของ', amount: 5000 },
      { date: '27/04/2568', type: 'รายจ่าย', descrip: 'ค่าน้ำมัน', amount: 300 }
    ];*/

    const groupedByDate = {};
    let itemContents;
    // 1. แยกข้อมูลตามวัน
    rows.forEach(row => {
      const date = row.date; // สมมติ row.date เป็น "26/04/2568" แล้ว
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(row);
    });

    let chk = true;

    // 2. สร้าง bubbles ต่อวัน
    const bubbles = Object.keys(groupedByDate).map(date => {
      const items = groupedByDate[date];

      itemContents = items.map(row => ({
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: `${row.type}: ${row.descrip}`,
            size: 'sm',
            color: row.type === 'รายรับ' ? '#228B22' : '#DC143C',
            flex: 5
          },
          {
            type: 'text',
            text: `$${(row.type === 'รายรับ' ? Number(row.income) : Number(row.expense)).toFixed(2)}`,
            size: 'sm',
            color: row.type === 'รายรับ' ? '#228B22' : '#DC143C',
            align: 'end',
            flex: 2
          }
        ]
      }));

      const total = items.reduce((sum, row) => row.income === null ? sum - Number(row.expense) : sum + Number(row.income), 0);

      // เพิ่ม total, cash, change
      itemContents.push(
        { type: "separator", margin: "md" },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            { type: "text", text: "TOTAL_PERDAY", size: "sm", color: "#888888", weight: 'bold' },
            { type: "text", text: `$${total.toFixed(2)}`, size: "sm", color: "#888888", weight: 'bold', align: "end" }
          ]
        }
      );
      if (chk) {
        itemContents.push(
          { type: "separator", margin: "md" },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "TOTAL", size: "sm", color: "#555555", weight: 'bold' },
              { type: "text", text: `$${Number(sum_amt).toFixed(2)}`, size: "sm", color: "#111111", weight: 'bold', align: "end" }
            ]
          }
        );
        chk = false;
      }

      return {
        type: 'bubble',
        styles: {
          header: { backgroundColor: '#ffffff' },
          body: { backgroundColor: '#ffffff' }
        },
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: date,
              size: 'xl',
              weight: 'bold',
              color: '#333333'
            },
            {
              type: 'text',
              text: 'Bangkok, Thailand',
              size: 'sm',
              color: '#888888'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: itemContents
        }
      };
    });


    // 3. รวม bubble เป็น carousel
    const flexMessage = {
      type: 'flex',
      altText: 'รายการรายรับรายจ่าย',
      contents: {
        type: 'carousel',
        contents: bubbles
      }
    };

    // 4. ส่งข้อความ
    await client.replyMessage({
      replyToken,
      messages: [flexMessage]
    });

  } catch (error) {
    console.error('Error sending summary:', error);
  }
}

async function formatType(client, replyToken,texts) {
  console.log('combinetext :',texts)
  const bubbles = texts.map(txt => ({
    type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: `${txt.text}`, weight: "bold", size: "xl" }
              //,
              //{ type: "text", text: "$11.99", weight: "bold", size: "lg", color: "#FF0000" },
              //{ type: "text", text: "Temporarily out of stock", size: "sm", color: "#FF5555" }
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
              {
                type: "button",
                style: "primary",
                color: "#aaaaaa",
                action: {
                  type: "message",
                  label: `${txt.text}`,
                  text: `${txt.text}`
                }
              },
            ]
          }
  }));
  const replyMessages = {
    type: "flex",
    altText: "สินค้า",
    contents: {
      type: "carousel",
      contents: bubbles
    }
  };

  // ส่ง Flex
  await client.replyMessage({
    replyToken,
    messages: [replyMessages]
  });
}

module.exports = {
  replyText,
  replyDetail,
  formatType
};
