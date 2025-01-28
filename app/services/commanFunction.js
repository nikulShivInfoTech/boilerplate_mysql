const search = (data, searchKey, searchValue) => {
    if (!searchValue) return data;
    return data.filter(item =>
        item[searchKey].toLowerCase().includes(searchValue.toLowerCase())
    );
};

const sort = (data, sortBy, order = 'asc') => {
    if (!sortBy) return data;
    const sortedData = [...data];
    sortedData.sort((a, b) => {
        if (order === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
        return a[sortBy] < b[sortBy] ? 1 : -1;
    });
    return sortedData;
};

const paginate = (data, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return data.slice(startIndex, endIndex);
};

module.exports = { search, sort, paginate };
