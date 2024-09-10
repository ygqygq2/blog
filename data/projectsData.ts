interface Project {
  title: string,
  description: string,
  href?: string,
  imgSrc?: string,
}

const projectsData: Project[] = [
  {
    title: 'turbo print log',
    description: `Turbo Console Log for more languages`,
    imgSrc: 'https://www.ygqygq2.com/images/turbo-print-log.png',
    href: 'https://marketplace.visualstudio.com/items?itemName=ygqygq2.turbo-print-log',
  },
  {
    title: 'turbo file header',
    description: `一个好用的代码文件头管理扩展`,
    imgSrc: 'https://www.ygqygq2.com/images/turbo-file-header.png',
    href: 'https://marketplace.visualstudio.com/items?itemName=ygqygq2.turbo-file-header',
  },
]

export default projectsData
