const axios = require('axios').default;

export default class SearchImg {
  constructor() {
    this.name = '';
    this.page = 1;
  }
  async fetchImgByName() {
    try {
      const response = await axios.get('https://pixabay.com/api/', {
        params: {
          key: '31896211-af67c123f37fbd4748dd625ab',
          q: this.name,
          page: this.page,
          per_page: 12,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
        },
      });
      this.page += 1;
      return response.data;
    } catch (error) {
      console.log(error.message);
    }
  }
  get query() {
    return this.name;
  }
  set query(newName) {
    this.name = newName;
  }
}
