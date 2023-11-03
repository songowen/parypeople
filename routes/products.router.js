const express = require('express');
const router = express.Router();
const Product = require('../schemas/products.schema');

//1. 상품 등록---------------------
router.post('/', async (req, res) => {
  try {
    const { title, content, author, password } = req.body;

    // 필수 필드가 모두 제공되었는지 확인
    if (!title || !content || !author || !password) {
      return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }

    // 새 상품을 생성하고 데이터베이스에 저장
    const newProduct = new Product({
      title,
      content,
      author,
      password,
      status: 'FOR_SALE', // 판매 중 상태로 초기화
      createdAt: new Date(), // 현재 날짜로 초기화
    });

    await newProduct.save(); // 데이터베이스에 저장

    res.json({ message: '판매 상품을 등록하였습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 오류가 발생하였습니다.' });
  }
});

// 2. 상품목록 조회 API----------------
router.get('/', async (req, res) => {
  try {
    // 데이터베이스에서 모든 상품을 조회하고 생성일을 기준으로 내림차순 정렬
    const products = await Product.find().sort({ createdAt: -1 });

    const responseData = products.map((product) => ({
      _id: product._id,
      title: product.title,
      author: product.author,
      status: product.status,
      createdAt: product.createdAt,
    }));

    res.json({ data: responseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 오류가 발생하였습니다.' });
  }
});

//3. 상품 상세조회 API--------------
router.get('/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // # 400 body 또는 params를 입력받지 못한 경우
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }

    // 데이터베이스에서 상품을 찾음
    const product = await Product.findById(productId);

    // # 404 productId에 해당하는 상품이 존재하지 않을 경우
    if (!product) {
      return res.status(404).json({ message: '상품 조회에 실패하였습니다.' });
    }

    // 상품 정보를 클라이언트에 반환
    res.json({ data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: '서버 오류가 발생하였습니다.' });
  }
});

// 4. 상품 수정 API---------------
router.put('/:productId', async (req, res) => {
  try {
    const { title, content, password, status } = req.body;
    const productId = req.params.productId;

    // 필수 필드가 모두 제공되었는지 확인
    if (!title || !content || !password || !status) {
      return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }

    // 데이터베이스에서 상품을 찾음
    const product = await Product.findById(productId);

    // 상품이 존재하지 않으면 404 응답 반환
    if (!product) {
      return res.status(404).json({ message: '상품 조회에 실패하였습니다.' });
    }

    // 비밀번호 비교
    if (password !== product.password) {
      return res.status(401).json({ message: '상품을 수정할 권한이 존재하지 않습니다.' });
    }

    // 상품 정보 수정
    product.title = title;
    product.content = content;
    product.status = status;

    await product.save();

    res.json({ message: '상품 정보를 수정하였습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생하였습니다.' });
  }
});

// 5.상품 삭제-----------------
router.delete('/:productId', async (req, res) => {
  try {
    
    const productId = req.params.productId;
    const product = await Product.findById(productId); // 싱품 찾음

   // # 400 body 또는 params를 입력받지 못한 경우
   if (!product) {
    return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
  }

 // 비밀번호를 어떻게 받아오는지에 따라 수정되어야 함
 const { password } = req.body; // 예시: 요청의 본문에서 비밀번호를 받아옴


    // 비밀번호 비교
    if (password !== product.password) {
      return res.status(401).json({ message: '상품을 삭제할 권한이 존재하지 않습니다.' });
    }

    //상품삭제 
    await product.deleteOne();

    res.json({ message: '상품을 삭제하였습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생하였습니다.' });
  }
});

module.exports = router;
