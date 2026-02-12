import { queryPosts } from '../src/server/modules/blog/blog.service';

async function main() {
  console.log('Testing queryPosts...');
  try {
    const result = await queryPosts({ currentPage: 1, limit: 10 });
    console.log('Success:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
