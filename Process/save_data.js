const { replyText, replyDetail } = require('./replymessage.js');
const { runQuery } = require('../routes');



async function save(client, replyToken, gettext, quoteToken, userId, type, callback) {
    try {
        //let replyText = '';
        let text = gettext.split('|');
        let desc = text[1];

        console.log('desc: ', desc);
        let amount = Number(text[2]);  // ใช้ Number แทน double
        console.log('amount: ', amount);
        let check_first = false
        let getuserid, bookname;
        let textArr = [];
        let combineTextErr;

        try {
            console.log('log100');
            let query = ('SELECT * FROM USERS_BOOK WHERE userid = $1');
            await runQuery(query, [userId], (err, data) => {
                if (err) {
                    throw new Error(err);
                }
                console.log('หลัง Query');
                if (data.length === 0) {
                    combineTextErr = 'ไม่พบสมุดรายรับรายจ่าย\n';
                    combineTextErr += "กำลังสร้างสมุดบันทึกรายรับรายจ่าย ชื่อ 'รายรับ-รายจ่าย'";
                    textArr.push(combineTextErr);
                    //textArr.push('ไม่พบสมุดรายรับรายจ่าย');
                    //textArr.push("กำลังสร้างสมุดบันทึกรายรับรายจ่าย ชื่อ 'รายรับ-รายจ่าย'");
                    //replyText(client, replyToken, ['ไม่พบสมุดรายรับรายจ่าย',"กำลังสร้างสมุดบันทึกรายรับรายจ่าย ชื่อ 'รายรับ-รายจ่าย'"], '', userId);
                    check_first = true;
                    console.log('check_first1', check_first);
                } else {
                    console.log('data row1:', data);
                    const { userid: a, book_name: b } = data[0];
                    console.log('getuserid: ', a);
                    getuserid = a;
                    console.log('bookname: ', b);
                    bookname = b;
                }

            });
            console.log('check_first2', check_first);
            if (check_first) {
                console.log('check_first3', check_first);
                query = ('INSERT INTO USERS_BOOK (userid,book_name) values ($1,$2)');
                console.log('query', query);
                await runQuery(query, [userId, 'รายรับ-รายจ่าย'], (err, data) => {
                    if (err) {
                        throw new Error(err);
                    }
                    //textArr.push('สร้างสำเร็จ!!!');
                    //replyText(client, replyToken, ['สร้างสำเร็จ!!!'], '', userId);
                });
                ({ getuserid, bookname } = { getuserid: userId, bookname: 'รายรับ-รายจ่าย' });

                query = ('INSERT INTO sum_money (userid,book_name,sum) values ($1,$2,0)');
                await runQuery(query, [userId, 'รายรับ-รายจ่าย'], (err, data) => {
                    if (err) {
                        throw new Error(err);
                    }

                });

            }

            const now = new Date().toLocaleDateString('th-TH');
            const SMPT = new Date();
            query = ('insert into book_detail (userid,book_name,descrip,income,expense,type,date,smpt) values ($1,$2,$3,$4,$5,$6,$7,$8)');
            if (type === 'รายรับ') {
                await runQuery(query, [getuserid, bookname, desc, amount, null, type, now, SMPT], (err, data) => {
                    if (err) {
                        replyText(client, replyToken, ['ไม่สามารถจดรายการได้'], '', userId);
                        throw new Error('ไม่สามารถสร้างรายการได้', err);
                    }
                    textArr.push('บันทึกรายการสำเร็จ');
                    //replyText(client,replyToken,['บันทึกรายการสำเร็จ'],'',userId);
                });

                query = ('UPDATE sum_money SET sum = ( (SELECT sum FROM sum_money WHERE userid = $1 AND book_name = $2) + $3) WHERE userid = $1 AND book_name = $2');
                await runQuery(query, [getuserid, bookname, amount], (err, data) => {
                    if (err) {
                        replyText(client, replyToken, ['ไม่สามารถสร้างรายการได้'], '', userid);
                        throw new Error('ไม่สามารถสร้างรายการได้', err);
                    }
                });
            }
            else if (type === 'รายจ่าย') {
                await runQuery(query, [getuserid, bookname, desc, null, amount, type, now, SMPT], (err, data) => {
                    if (err) {
                        replyText(client, replyToken, ['ไม่สามารถจดรายการได้'], '', userId);
                        throw new Error('ไม่สามารถจดรายการได้', err);
                    }
                    textArr.push('บันทึกรายการสำเร็จ');
                    //replyText(client,replyToken,['บันทึกรายการสำเร็จ'],'',userId);
                });

                query = ('UPDATE sum_money SET sum = ( (SELECT sum FROM sum_money WHERE userid = $1 AND book_name = $2) - $3) WHERE userid = $1 AND book_name = $2');
                await runQuery(query, [getuserid, bookname, amount], (err, data) => {
                    if (err) {
                        replyText(client, replyToken, ['ไม่สามารถสร้างรายการได้'], '', userid);
                        throw new Error('ไม่สามารถสร้างรายการได้', err);
                    }
                });
            }
            let sum_amt;
            query = ('select sum from sum_money where userid = $1 and book_name = $2');
            await runQuery(query, [getuserid, bookname], (err, data) => {
                if (err) {
                    err_sum = 'เกิดข้อผิดพลาด';
                }
                console.log('dataSUM: ', data);
                sum_amt = data;
                console.log('sum_amt: ', sum_amt);
            })
            await get_bookdetail(client, replyToken, getuserid, bookname, (err, data) => {
                if (err) {
                    console.log(err);
                    throw new Error(err);
                }
                data.forEach(s => {
                    s.date = convertdate(s.date);
                });
                return replyDetail(client, replyToken, data, sum_amt[0].sum);


            });
            //replyText(client, replyToken, textArr, '', userId);



        }
        catch (err) {
            callback(err);
            return;
        }
        /*getAccountBook(userId, (err, data) => {
            if (err || data.length === 0) {
                replyText(replyToken, 'ไม่พบสมุดรายรับรายจ่าย', quoteToken, userId);
                replyText(replyToken, 'กำลังสร้างสมุดบันทึกรายรับรายจ่าย', quoteToken, userId);
            }
        
            insertAccountBook(userId, desc, amount, (err, data) => {
                if (err) return replyText(replyToken, 'ไม่สามารถบันทึกรายการได้', quoteToken, userId);
    
                replyText(replyToken, 'บันทึกรายการสำเร็จ', quoteToken, userId);
                replyText = `📌 ${type}: ${desc}, จำนวนเงิน: ${amount}`;
                replyText(replyToken, replyText, quoteToken, userId);
            });
        });*/
    } catch (err) {
        callback(err, null);
    }
    return callback(null, null);
};


async function get_bookdetail(client, replyToken, getuserid, bookname, callback) {
    let textArr = [];
    let err_sum;
    let date, income, expense, descrip, type;
    let sum_amt = 0;


    query = ('select date,descrip,income,expense,type from book_detail where userid = $1 and book_name = $2 order by SMPT desc limit 10');

    await runQuery(query, [getuserid, bookname], (err, data) => {
        if (err) {
            replyText(client, replyToken, ['มีบางอย่างผิดพลาด'], '', userId);
            throw new Error(err);
        }
        return callback(null, data);

        //let countRows = data.length;
        console.log('data: ', data)
        console.log('data.length: ', data.length)
        console.log('textArr:', textArr)
        let cnt = 0;

        let combinedText = '';
        data.forEach(s => {
            let amount = 0;
            ({ date, income, expense, descrip, type } = s);

            console.log('date before convert: ', date);
            date = convertdate(date);
            console.log('date after convert: ', date);
            if (income === null)
                income = 0;
            else if (expense === null)
                expense = 0;
            amount = Number(income + expense);
            cnt++;
            if (type === 'รายรับ') {
                combinedText += `📗${date}  ${type}: ${descrip}, จำนวนเงิน: ${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท\n`;
                //textArr.push(`📗 ${type}: ${descrip}, จำนวนเงิน: ${amount.toFixed(2)} บาท`);
            }
            else if (type === 'รายจ่าย') {
                combinedText += `📕${date}  ${type}: ${descrip}, จำนวนเงิน: ${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท\n`;

                //textArr.push(`📕 ${type}: ${descrip}, จำนวนเงิน: ${amount.toFixed(2)} บาท`);
            }

            //sum_amt = Number(sum_amt + (income - expense));
        });
        textArr.push(combinedText);

        if (sum_amt === 0) {
            textArr.push(`📌 ยอดรวมทั้งหมด: ${err_sum}`);
        }
        else {
            console.log('last sum_amt', sum_amt);
            sum_amt = Number(sum_amt[0].sum);
            console.log('Number(sum_amt)', sum_amt);
            textArr.push(`📌 ยอดรวมทั้งหมด: ${sum_amt.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท\n`);
        }

        return callback(null, textArr);
    });
};

function convertdate(getdate) {
    const date = new Date(getdate);

    // ปรับเวลาให้ตรง Timezone ไทย (UTC+7)
    const localDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));

    // แยกค่าวัน/เดือน/ปี
    const day = localDate.getDate().toString().padStart(2, '0');
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const year = (localDate.getFullYear()).toString(); // แปลงเป็น พ.ศ.

    const formatted = `${day}/${month}/${year}`;
    return formatted;

};


async function get_users_book(client, replyToken, getuserid, callback) {
    let query = ('select book_name from users_book where userid = $1');
    let textArr = [];
    let bookname;
    await runQuery(query, [getuserid], (err, data) => {
        if (err) {
            console.log('getusersbook :' + err);
            throw new Error(err);
        }
        data.forEach(s => {
            bookname = s.book_name;
            textArr.push(bookname);

        });
        console.log('textArr :', textArr);

    })
    console.log('ก่อนเข้า replytext get_users_book :');

    return callback(null, textArr);
};
module.exports = {
    save,
    get_bookdetail,
    get_users_book,
    convertdate
};
