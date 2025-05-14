const { runQuery } = require('./routes');
const { save, get_bookdetail, get_users_book, convertdate } = require('./Process/save_data');
const { replyText, replyDetail, formatType } = require('./Process/replymessage.js');

/*const replyMessage = (replyToken, text, quoteToken, userId) => {
    return client.replyMessage({
        replyToken,
        messages: [{
            type: 'text',
            text,
            quoteToken
        }]
    });
};*/

async function incomeExpense(client, replyToken, text, quoteToken, userId) {
    let IncomeOrExpenses_EN = ['INCOME', 'EXPENSES'];
    let IncomeOrExpenses_TH = ['รายรับ', 'รายจ่าย'];
    let Income = ['INCOME', 'รายรับ'];
    let Expense = ['EXPENSES', 'รายจ่าย'];
    //let replyText = '';

    let setTypePattern = [...IncomeOrExpenses_EN, ...IncomeOrExpenses_TH].join('|');
    const setPatternInsert = new RegExp(`^(${setTypePattern})\\|([^|]+)\\|([1-9][0-9]*)$`, 'i'); //i = case-insensitive ทำให้ income|salary|1000 กับ INCOME|salary|1000

    let matchPattern1 = false; //pattern สำหรับบันทุกรายรับรายจ่าย
    let matchPattern2 = false; //pattern สำรหับแสดงสมุดบันทึกรายรับรายจ่าย
    let matchPattern3 = false;

    let users_book = [];
    await get_users_book(client, replyToken, userId, (err, data) => {
        if (err) {
            console.log('ยังไม่มีการสร้างสมุดบัญชีเลย');
        }
        console.log('get_users_book :', data);
        users_book = data;
        //if(users_book.some(s => s === text))
        //    matchPattern3 = true;
    });

    console.log('users_book : ', users_book);
    if (users_book.some(s => s === text))
        console.log('true');
    if (setPatternInsert.test(text)) {
        matchPattern1 = true; // ตรวจสอบว่าข้อความตรงกับรูปแบบหรือไม่
    } else if (text === 'แสดงชื่อสมุด') {
        matchPattern2 = true;
    } else if (users_book.some(s => s === text)) {
        matchPattern3 = true;
    }
    else if (text === 'ทดสอบ1') {
        console.log('ทดสอบ1');
        test1(client, replyToken);
        return;
    }
    else if(text === 'บันทึกรายการ'){
        replyText(client,replyToken,['กรุณาพิมพ์ดังนี้ "รายรับ หรือ รายจ่าย|คำอธิบาย|ยอดเงิน"'],'',userId);
        return;
    }
    else {
        let combinetext = [];
        //combinetext += 'รูปแบบการพิม\n';
        combinetext.push({
            text: 'บันทึกรายการ'
        });

        combinetext.push({
            text: 'แสดงชื่อสมุด'
        });
        /*combinetext.push({
            text: 'แสดงยอดเงินในสมุด : ชื่อสมุดของคุณ'
        });*/
        console.log('log002');
        //replyText(client, replyToken, ['รูปแบบกา่รพิมพ์', combinetext], '', userId);
        formatType(client, replyToken, combinetext);

        return;
    }
    console.log('matchPattern1:', matchPattern1);
    console.log('matchPattern2:', matchPattern2);
    console.log('matchPattern3:', matchPattern3);

    if (matchPattern1) {
        let textsplit = text.split('|');
        let type = textsplit[0];

        // ตรวจสอบประเภทของการบันทึก
        if (Income.includes(type)) {
            type = 'รายรับ';
        } else if (Expense.includes(type)) {
            type = 'รายจ่าย';
        } else {
            console.log('log004');
            return replyText(client, replyToken, 'ไม่พบรูปแบบของประเภทรายการ', '', userId);
        }
        console.log('log005');
        save(client, replyToken, text, quoteToken, userId, type, (err, data) => {
            if (err) {
                console.log('log006', err);
                return;
            }
            return;
        });


    } else if (matchPattern2) {  // ตรวจสอบว่าเป็น matchPattern2 หรือไม่
        let combinetext = [];
        return await get_users_book(client, replyToken, userId, (err, data) => {
            if (err) {
                console.log('Error get_users_book: ' + err);
                throw new Error(err);
            }
            console.log('data match2 : ', data);
            data.forEach(s => {
                combinetext.push({ text: s});
            });
            //replyText(client, replyToken, ['รายชื่อสมุด', combinetext], '', userId);
            formatType(client, replyToken, combinetext);

        });
        /*await get_bookdetail(client,replyToken, userId,'รายรับ-รายจ่าย',(err,data) =>{
            if (err || data.length === 0) {
                return replyMessage(replyToken, ['ไม่พบสมุดรายรับรายจ่าย'], quoteToken, userId);
            }
    
            data.forEach(s => {
                textArr.push(s);
            });
            replyText(client,replyToken,textArr,'',userId);
        });*/
    } else if (matchPattern3) {
        let sum_amt;
        query = ('select sum from sum_money where userid = $1 and book_name = $2');
        await runQuery(query, [userId, text], (err, data) => {
            if (err) {
                err_sum = 'เกิดข้อผิดพลาด';
            }
            console.log('dataSUM: ', data);
            sum_amt = data;
            console.log('sum_amt: ', sum_amt);
        })
        get_bookdetail(client, replyToken, userId, text, (err, data) => {
            if (err) {
                replyText(client, replyToken, ['เกิดข้อผิดพลาด'], '', userId);
                console.log('Error match3' + err);
                throw new Error(err);
            }
            console.log('data match3 : ', data);
            data.forEach(s => {
                s.date = convertdate(s.date);
            });
            console.log('data match3 : ', data);

            return replyDetail(client, replyToken, data, sum_amt[0].sum);
        });
    }


};


module.exports = {
    incomeExpense
};