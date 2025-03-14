
document.querySelectorAll('.social-link').forEach(link =>{
    link.addEventListener('click', (event)=>{
        event.preventDefault()
        event.stopPropagation()
        window.open(link.href, '_blank')
    })
})

document.getElementById("btnProfile").addEventListener("click", function() {
    document.getElementById("sidebar").classList.add("open");
});

document.getElementById("closeBtn").addEventListener("click", function() {
    document.getElementById("sidebar").classList.remove("open");
});

const getDialogState = document.getElementById('getDialogState')

document.getElementById('getState').addEventListener('click', function(){
    getDialogState.showModal()
    document.body.classList.add('blocking')
})

document.querySelector('.closeDialog').addEventListener('click', function(){
    getDialogState.close()
    document.body.classList.remove('blocking')
})

const btnRebut = document.getElementById('rebut')
const btnCloseDialog = document.getElementById('closeDialog')
const dialog = document.getElementById('myDialog')

btnRebut.addEventListener('click', function(){
    dialog.showModal()
    document.body.classList.add('blocking')
})

btnCloseDialog.addEventListener('click', function(){
    dialog.close()
    document.body.classList.remove('blocking')
})

function initIntersectionObserver(){
    const options = {
        root: null,
        rootMargin: '100px',
        threshold: 0,
    }

    const observer = new IntersectionObserver(function (entries, observer){
        entries.forEach(entry =>{
            if (entry.isIntersecting){
                entry.target.classList.add('visible')
                observer.unobserve(entry.target)
            }
        })
    }, options)

    document.querySelectorAll('.nav, .greeting, main, .img-header, .description-header, .description-footer, .img-footer, .inf, .registration, .reg, .sign, .choice, .about, .posts').forEach(element =>{
        observer.observe(element)
    })
}

window.addEventListener('DOMContentLoaded', initIntersectionObserver)